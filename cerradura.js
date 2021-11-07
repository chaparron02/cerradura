#!/usr/bin/env node
const Gpio = require("pigpio").Gpio;
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

const estadoCerradura = true;

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
  storageBucket: "bucket.appspot.com",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database);
get(child(dbRef, "locks/test"))
  .then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
    } else {
      console.log("No data available");
    }
  })
  .catch((error) => {
    console.error(error);
  });
//const usersRef  = ref(database, 'locks');

//abrir();

boton.on("interrupt", function (level) {
  if (level == 0) {
    if (estadoCerradura) {
      cerrar();
    } else {
      abrir();
    }
  }
});

/* actualmente parte de BLYNK migrar a FIREBASE
v0.on('write', function(param) {
	console.log('V0:', param);
  	if (param[0] === '0') { //unlocked
  		cerrar()
  	} else if (param[0] === '1') { //locked
  		abrir()
  	} else {
  		blynk.notify("Door lock button was pressed with unknown parameter");
  	}
});
*/

function abrir() {
  motor.servoWrite(cerrado);
  led.digitalWrite(1);
  estadoCerradura = true;

  // Despues de 1.5 segundos, apagamos el motor para que no se dañe
  setTimeout(function () {
    motor.servoWrite(0);
  }, 1500);
}

function cerrar() {
  motor.servoWrite(abierto);
  led.digitalWrite(0);
  estadoCerradura = false;

  // Despues de 1.5 segundos, apagamos el motor para que no se dañe
  setTimeout(function () {
    motor.servoWrite(0);
  }, 1500);
}
