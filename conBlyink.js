#!/usr/bin/env node

// ***************Inicio Variables*************
// tiempos para ajustar el angulo del motor
var unlock = 1000;
var lock = 2200;

// puntos del motor
var puntoMotor = 14;
var puntoBoton = 4
var puntoLed = 17

var blynkToken = 'nUcV490BkCGOE9TfgYKrtrSm8qhnYXfH';

var estadoCerradura = true

// ***************Fin Variables*************

// configuración del motor
var Gpio = require('pigpio').Gpio,
  motor = new Gpio(puntoMotor, {mode: Gpio.OUTPUT}),
  button = new Gpio(puntoBoton, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.FALLING_EDGE
  }),
  led = new Gpio(puntoLed, {mode: Gpio.OUTPUT});

//Setup blynk
var Blynk = require('blynk-library');
var blynk = new Blynk.Blynk(blynkToken,options = {connector: new Blynk.TcpClient()});
var v0 = new blynk.VirtualPin(0);

console.log("locking door")
lockDoor()

button.on('interrupt', function (level) {
	console.log("level: " + level + " locked: " + estadoCerradura)
	if (level == 0) {
		if (estadoCerradura) {
			unlockDoor()
		} else {
			lockDoor()
		}
	}
});

v0.on('write', function(param) {
	console.log('V0:', param);
  	if (param[0] === '0') { //unlocked
  		unlockDoor()
  	} else if (param[0] === '1') { //locked
  		lockDoor()
  	} else {
  		blynk.notify("Door lock button was pressed with unknown parameter");
  	}
});

blynk.on('connect', function() { console.log("Blynk ready."); });
blynk.on('disconnect', function() { console.log("DISCONNECT"); });

function lockDoor() {
	motor.servoWrite(lock);
	led.digitalWrite(1);
	estadoCerradura = true

	//notify
  	blynk.notify("Door has been locked!");
  	
  	//After 1.5 seconds, the door lock servo turns off to avoid stall current
  	setTimeout(function(){motor.servoWrite(0)}, 1500)
}

function unlockDoor() {
	motor.servoWrite(unlock);
	led.digitalWrite(0);
	estadoCerradura = false

	//notify
  	blynk.notify("Door has been unlocked!"); 

  	//After 1.5 seconds, the door lock servo turns off to avoid stall current
  	setTimeout(function(){motor.servoWrite(0)}, 1500)
}
