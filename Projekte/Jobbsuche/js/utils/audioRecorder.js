export const audioRecorder = {
    mediaRecorder: null,
    audioChunks: [],
    recordingBlob: null,
    recordingUrl: null,
    startTime: null,
    timerInterval: null,
    isRecording: false,

    async startRecording(onTickCallback) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.startTime = Date.now();
            this.isRecording = true;

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();

            if (onTickCallback) {
                this.timerInterval = setInterval(() => {
                    const elapsedMs = Date.now() - this.startTime;
                    const seconds = Math.floor((elapsedMs / 1000) % 60);
                    const minutes = Math.floor(elapsedMs / 1000 / 60);
                    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    onTickCallback(formatted, elapsedMs);
                }, 500);
            }

            return true;
        } catch (err) {
            console.error("Fehler beim Zugriff auf das Mikrofon:", err);
            throw new Error("Mikrofon-Zugriff verweigert oder nicht verfügbar.");
        }
    },

    stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || !this.isRecording) {
                resolve(null);
                return;
            }

            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }

            this.mediaRecorder.onstop = () => {
                this.isRecording = false;
                const durationSeconds = Math.round((Date.now() - this.startTime) / 1000);
                this.recordingBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.recordingUrl = URL.createObjectURL(this.recordingBlob);

                // Stop microphone tracks
                if (this.mediaRecorder.stream) {
                    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                }

                resolve({
                    blob: this.recordingBlob,
                    url: this.recordingUrl,
                    durationSeconds: durationSeconds
                });
            };

            this.mediaRecorder.stop();
        });
    },

    analyzeSpeechTempo(durationSeconds, wordCount) {
        if (!durationSeconds || durationSeconds <= 0) return { wpm: 0, feedback: 'Zu kurz' };
        
        const wpm = Math.round((wordCount / durationSeconds) * 60);
        let feedback = 'Optimales Sprechtempo';
        let status = 'good';

        if (wpm < 110) {
            feedback = 'Eher langsam / bedacht gesprochen';
            status = 'warning';
        } else if (wpm > 170) {
            feedback = 'Sehr hohes Sprechtempo – achte auf deutliche Aussprache & Pausen';
            status = 'warning';
        }

        return { wpm, feedback, status };
    }
};
