#!/usr/bin/env node
var Gpio = require("pigpio").Gpio

// ***************Inicio Variables*************
// tiempos para ajustar el angulo del motor
var abierto = 1000;
var cerrado = 2200;

// puntos del motor
var puntoMotor = 14;
var puntoBoton = 4
var puntoLed = 17


var estadoCerradura = true

// ***************Fin Variables*************

// configuración del motor
var motor = new Gpio(puntoMotor, { mode: Gpio.OUTPUT })

var boton = new Gpio(puntoBoton, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.FALLING_EDGE,
  })

var led = new Gpio(puntoLed, { mode: Gpio.OUTPUT });

abrir()

boton.on('interrupt', function (level) {
	if (level == 0) {
		if (estadoCerradura) {
			cerrar()
		} else {
			abrir()
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
	estadoCerradura = true

  	
  	// Despues de 1.5 segundos, apagamos el motor para que no se dañe
  	setTimeout(function(){motor.servoWrite(0)}, 1500)
}

function cerrar() {
	motor.servoWrite(abierto);
	led.digitalWrite(0);
	estadoCerradura = false

  	// Despues de 1.5 segundos, apagamos el motor para que no se dañe
  	setTimeout(function(){motor.servoWrite(0)}, 1500)
}
