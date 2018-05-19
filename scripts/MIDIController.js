var noteNames = ["C", "C#/Db", "D", "Eb/D#", "E", "F", "F#/Gb", "G", "Ab/G#", "A", "Bb/A#", "B"];
var controllers = [];

function init(){
	loadMIDI();
}

function loadMIDI(){
	if (navigator.requestMIDIAccess) {
		console.log("Browser supports MIDI!");
		navigator.requestMIDIAccess().then(MIDILoadSuccess, MIDILoadFailure); //Promises
	} else {
		concole.log("Browser does not support MIDI!");
	}
}

function MIDILoadSuccess(midi) {
	this.currentlyOnNotes = [];
	if(midi.inputs.size < 1){
		console.log("No MIDI input devices found!");
		return;
	}
	
	//Iterate through devices and attach controllers to them
	var inputs = midi.inputs.values();
	for (var input = inputs.next(); input && !input.done; input = inputs.next()){
		var c = new MIDIController(input.value.name, input.value.manufacturer);
		input.value.onmidimessage = c.onMIDIMessage;
		controllers.push(c);
	}

	console.log(controllers);
}

function MIDILoadFailure() {
	console.error("No access to your midi devices.");
}

class MIDIController {
	constructor(device, manufacturer){
		this.device = device;
		this.manufacturer = manufacturer;
		this.currentlyOnNotes = [];
	}

	onMIDIMessage (message) {
		//message.data[0] == event type
			//144 = noteOn, 128 = noteOff
		//message.data[1] == event key
		//message.data[2] == key velocity
		
		if(message.data[0] == 144){
			if(currentlyOnNotes.indexOf(message.data[1]) == -1){
				currentlyOnNotes.push(message.data[1]);
			}
		} else if(message.data[0] == 128){
			var index = currentlyOnNotes.indexOf(message.data[1]);
			if(index > -1){
				currentlyOnNotes.splice(index, 1);
			}
		}
		
		console.log(currentlyOnNotes);
		// console.log(message.data);
		// console.log(mapMIDItoNoteName(message.data[1]));
		// console.log(mapMIDItoNoteFrequency(message.data[1]));
	}
}

//Help functions for MIDI:
function mapMIDItoNoteName(MIDINumber){
	var noteNumber = MIDINumber%12; //Note number in semitones/halfsteps relative to C
	var noteName = noteNames[noteNumber]; //Mapped note name
	var octave = Math.floor(MIDINumber/12)-1;
	return [noteNumber, octave, noteName];
}

function mapMIDItoNoteFrequency(MIDINumber){
	return Math.pow(2, ((MIDINumber - 69) / 12)) * 440;
}