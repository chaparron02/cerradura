#!/usr/bin/env node
const Gpio = require("pigpio").Gpio;
const printMessage = require("print-message");
const execSync = require("child_process").execSync;
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue, child, get } = require("firebase/database");

// ***************Inicio Variables*************
// tiempos para ajustar el angulo del motor
const abierto = 1000;
const cerrado = 2200;

// puntos del motor
const puntoMotor = 14;
const puntoBoton = 4;
const puntoLed = 17;

let estadoCerradura = true;

// ***************Fin Variables*************

// configuración del motor
const motor = new Gpio(puntoMotor, { mode: Gpio.OUTPUT });

const boton = new Gpio(puntoBoton, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.FALLING_EDGE,
});

const led = new Gpio(puntoLed, { mode: Gpio.OUTPUT });

// configuración de FireBase

const firebaseConfig = {
  apiKey: "AIzaSyCxiv1_oGdPCaWEoOhwcUYn0mfD8cFWLo8",
  authDomain: "domotic-ur.firebaseapp.com",
  databaseURL: "https://domotic-ur-default-rtdb.firebaseio.com/",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const starCountRef = ref(database, "locks/Test/is_locked");

abrir();

onValue(starCountRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    cerrar();
  } else {
    abrir();
  }
});

boton.on("interrupt", function (level) {
  if (level == 0) {
    if (estadoCerradura) {
      cerrar();
    } else {
      abrir();
    }
  }
});

function abrir() {
  execSync('figlet -f slant -c "Abriendo cerradura" | lolcat', { encoding: "utf-8" });
  printMessage("Abriendo cerradura");
  motor.servoWrite(cerrado);
  led.digitalWrite(1);
  estadoCerradura = true;

  // Despues de 1.5 segundos, apagamos el motor para que no se dañe
  setTimeout(function () {
    motor.servoWrite(0);
  }, 1500);
}

function cerrar() {
  execSync('figlet -f slant -c "Cerrando cerradura" | lolcat', { encoding: "utf-8" });
  printMessage("Cerrando cerradura");
  motor.servoWrite(abierto);
  led.digitalWrite(0);
  estadoCerradura = false;

  // Despues de 1.5 segundos, apagamos el motor para que no se dañe
  setTimeout(function () {
    motor.servoWrite(0);
  }, 1500);
}
