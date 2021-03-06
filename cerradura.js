#!/usr/bin/env node
const Gpio = require("pigpio").Gpio;
const lolcatjs = require("lolcatjs");
const figlet = require("figlet");
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
  print("Abriendo cerradura");
  motor.servoWrite(cerrado);
  led.digitalWrite(1);
  estadoCerradura = true;

  // Despues de 1.5 segundos, apagamos el motor para que no se dañe
  setTimeout(function () {
    motor.servoWrite(0);
  }, 60);
}

function cerrar() {
  print("Cerrando cerradura");
  motor.servoWrite(abierto);
  led.digitalWrite(0);
  estadoCerradura = false;

  // Despues de 1.5 segundos, apagamos el motor para que no se dañe
  setTimeout(function () {
    motor.servoWrite(0);
  }, 80);
}

function print(message) {
  figlet(message, function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.clear();
    lolcatjs.options.seed = Math.round(Math.random() * 1000);
    lolcatjs.options.colors = true;
    lolcatjs.fromString(data);
  });
}
