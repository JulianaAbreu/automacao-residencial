var five = require('johnny-five'); //Inclui módulos existentes em arquivos separados no programa
var mqtt = require('mqtt');
var board, led;
var brightness = 0;
let led_on = false;


board = new five.Board({ port: "COM8" });

var client = mqtt.connect('mqtt://test.mosquitto.org');
client.on('connect', function () {

    client.subscribe('lampada');
    client.subscribe('mqtt');
    client.subscribe('portao');
    client.publish('mqtt', ': Mqtt funciona')

});


client.on('message', function (topic, message) {
    console.log(topic, message.toString())
    //client.publish('led', 'teste');

})

client.disconnected ? console.log("Falha na conexão") : console.log("Conectado ao Mqtt");



board.on("ready", function () {
    var led = new five.Led(2);
    var button = new five.Button(6);
    var servo = new five.Servo(8);
    var pressed = true;
    var counter = 0;
    var buttonServo = new five.Button(7);
    var feedbackConnectedMqtt = new five.Button(4);

    button.on('press', function () {
        counter++;
        console.log('Botão pressionado ' +
            counter + ' vezes!');

        if (pressed) {
            led_on = true;
            led.on();
            client.publish('lampada', ': acendeu');
        }
        else {
            led_on = false;
            led.off();
            client.publish('lampada', ': desligou');
        }
        pressed = !pressed;
    });
    board.repl.inject({
        button: button,
        led: led
    });

    buttonServo.on('press', function () {
        if (pressed) {
            servo.to(90);
            client.publish('portao', ': Abriu');
        } else {
            servo.to(-90);
            client.publish('portao', ': Fechou');
        }
        pressed = !pressed;
    });
});
