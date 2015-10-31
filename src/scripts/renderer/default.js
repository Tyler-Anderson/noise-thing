/*
Tyler Anderson 2015
*/

const jQuery = require('jQuery');
const $ = jQuery;
const numeral = require('numeral');

console.log('renderer/default.js is go');

nx.onload = function(){
    nx.colorize('#68a3b1');
    nx.widgets.brownVolume.colors.accent = '#494132';
    nx.widgets.brownVolume.draw();
    nx.widgets.pinkVolume.colors.accent = '#db3f3e';
    nx.widgets.pinkVolume.draw();
    var elem = document.querySelector('.js-switch');
    var init = new Switchery(elem);

};


const context = new AudioContext(),
      gainNodes = {
          master: context.createGain(),
          pink: context.createGain(),
          brown: context.createGain(),
          white: context.createGain()
      };

const eventControls = {
    masterVolume: function(newValue){
        gainNodes.master.gain.value = newValue;
        $('#percent').html(
            numeral(newValue).format('0 %')
        );
    },
    pinkVolume: function(newValue){
        gainNodes.pink.gain.value = newValue;
    },
    brownVolume: function(newValue){
        gainNodes.brown.gain.value = newValue;
    },
    whiteVolume: function(newValue){
        gainNodes.white.gain.value = newValue;
    }
};


function* nodeItems(obj) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
}

for (let item of nodeItems(gainNodes)) {
    item[1].connect(context.destination);
}

function controlEvent(data) {
    eventControls[data.id](data.val);
};


//listeners for both controls 

nx.transmit = function(data){
    controlEvent({
      id :this.canvasID,
      val: parseFloat( numeral(this.val.value).format('0.00'))
    });
};
