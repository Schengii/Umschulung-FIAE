export const speechRecognitionHelper = {
    recognition: null,
    isListening: false,

    isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    },

    start(language = 'de-DE', onResultCallback, onErrorCallback) {
        if (!this.isSupported()) {
            if (onErrorCallback) onErrorCallback('Spracherkennung wird in diesem Browser nicht unterstützt.');
            return false;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = language;

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (onResultCallback) {
                onResultCallback({
                    finalText: finalTranscript,
                    interimText: interimTranscript
                });
            }
        };

        this.recognition.onerror = (event) => {
            console.warn('SpeechRecognition Fehler:', event.error);
            if (onErrorCallback) onErrorCallback(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        this.recognition.start();
        this.isListening = true;
        return true;
    },

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
};
