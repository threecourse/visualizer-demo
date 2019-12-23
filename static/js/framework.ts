declare var GIF: any;  // for https://github.com/jnordberg/gif.js

export module framework {

    export class Loader {
        public callback: (inputContent: string) => void;

        private seedInput: HTMLInputElement;
        private loadButton: HTMLInputElement;

        constructor() {
            this.loadClosure = () => this.load();
            this.loadButton = <HTMLInputElement>document.getElementById("loadButton");
            this.loadButton.addEventListener('click', this.loadClosure);
            this.seedInput = <HTMLInputElement>document.getElementById("seedInput");
        }

        private loadClosure: () => void;

        // データの読み込みを行った後、設定および描画指示まで行う
        private load() {

            var url = '/';
            fetch(url, {
                method: 'POST',
                credentials: "same-origin",
                body: JSON.stringify({"path": "none", "seed": this.seedInput.value}),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
                .then((jsonValue) => {
                    if (this.callback !== undefined) {
                        this.callback(jsonValue);
                    }
                })
                .catch(error => console.error('Error:', error));

        };

    }

    export class RichSeekBar {
        public callback: (value: number) => void;

        private seekRange: HTMLInputElement;
        private seekNumber: HTMLInputElement;
        private fpsInput: HTMLInputElement;
        private firstButton: HTMLInputElement;
        private prevButton: HTMLInputElement;
        private playButton: HTMLInputElement;
        private nextButton: HTMLInputElement;
        private lastButton: HTMLInputElement;
        private runIcon: HTMLElement;
        private intervalId: number;
        private playClosure: () => void;
        private stopClosure: () => void;

        constructor() {
            this.seekRange = <HTMLInputElement>document.getElementById("seekRange");
            this.seekNumber = <HTMLInputElement>document.getElementById("seekNumber");
            this.fpsInput = <HTMLInputElement>document.getElementById("fpsInput");
            this.firstButton = <HTMLInputElement>document.getElementById("firstButton");
            this.prevButton = <HTMLInputElement>document.getElementById("prevButton");
            this.playButton = <HTMLInputElement>document.getElementById("playButton");
            this.nextButton = <HTMLInputElement>document.getElementById("nextButton");
            this.lastButton = <HTMLInputElement>document.getElementById("lastButton");
            this.runIcon = document.getElementById("runIcon");
            this.intervalId = null;

            this.setMinMax(-1, -1);
            this.seekRange.addEventListener('change', () => {
                this.setValue(parseInt(this.seekRange.value));
            });
            this.seekNumber.addEventListener('change', () => {
                this.setValue(parseInt(this.seekNumber.value));
            });
            this.seekRange.addEventListener('input', () => {
                this.setValue(parseInt(this.seekRange.value));
            });
            this.seekNumber.addEventListener('input', () => {
                this.setValue(parseInt(this.seekNumber.value));
            });
            this.fpsInput.addEventListener('change', () => {
                if (this.intervalId !== null) {
                    this.play();
                }
            });
            this.firstButton.addEventListener('click', () => {
                this.stop();
                this.setValue(this.getMin());
            });
            this.prevButton.addEventListener('click', () => {
                this.stop();
                this.setValue(this.getValue() - 1);
            });
            this.nextButton.addEventListener('click', () => {
                this.stop();
                this.setValue(this.getValue() + 1);
            });
            this.lastButton.addEventListener('click', () => {
                this.stop();
                this.setValue(this.getMax());
            });
            this.playClosure = () => {
                this.play();
            };
            this.stopClosure = () => {
                this.stop();
            };
            this.playButton.addEventListener('click', this.playClosure);
        }

        public setMinMax(min: number, max: number) {
            this.seekRange.min = this.seekNumber.min = min.toString();
            this.seekRange.max = this.seekNumber.max = max.toString();
            this.seekRange.step = this.seekNumber.step = '1';
            this.setValue(min);
        }

        public getMin(): number {
            return parseInt(this.seekRange.min);
        }

        public getMax(): number {
            return parseInt(this.seekRange.max);
        }

        // setValueからcallbackを呼び出し、描画を行う
        public setValue(value: number) {
            value = Math.max(this.getMin(),
                Math.min(this.getMax(), value));  // clamp
            this.seekRange.value = this.seekNumber.value = value.toString();
            if (this.callback !== undefined) {
                this.callback(value);
            }
        }

        public getValue(): number {
            return parseInt(this.seekRange.value);
        }

        public getDelay(): number {
            const fps = parseInt(this.fpsInput.value);
            return Math.floor(1000 / fps);
        }

        private resetInterval() {
            if (this.intervalId !== undefined) {
                clearInterval(this.intervalId);
                this.intervalId = undefined;
            }
        }

        public play() {
            this.playButton.removeEventListener('click', this.playClosure);
            this.playButton.addEventListener('click', this.stopClosure);
            this.runIcon.classList.remove('play');
            this.runIcon.classList.add('stop');
            if (this.getValue() == this.getMax()) {  // if last, go to first
                this.setValue(this.getMin());
            }
            this.resetInterval();
            this.intervalId = setInterval(() => {
                if (this.getValue() == this.getMax()) {
                    this.stop();
                } else {
                    this.setValue(this.getValue() + 1);
                }
            }, this.getDelay());
        }

        public stop() {
            this.playButton.removeEventListener('click', this.stopClosure);
            this.playButton.addEventListener('click', this.playClosure);
            this.runIcon.classList.remove('stop');
            this.runIcon.classList.add('play');
            this.resetInterval();
        }
    }

    const saveUrlAsLocalFile = (url: string, filename: string) => {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        const evt = document.createEvent('MouseEvent');
        evt.initEvent("click", true, true);
        anchor.dispatchEvent(evt);
    };

    export class FileExporter {
        constructor(canvas: HTMLCanvasElement, seek: RichSeekBar) {
            const saveAsImage = <HTMLInputElement>document.getElementById("saveAsImage");
            const saveAsVideo = <HTMLInputElement>document.getElementById("saveAsVideo");

            saveAsImage.addEventListener('click', () => {
                saveUrlAsLocalFile(canvas.toDataURL('image/png'), 'canvas.png');
            });

            saveAsVideo.addEventListener('click', () => {
                if (location.href.match(new RegExp('^file://'))) {
                    alert('to use this feature, you must re-open this file via "http://", instead of "file://". e.g. you can use "$ python -m SimpleHTTPServer 8000"');
                }
                seek.stop();
                const gif = new GIF();
                for (let i = seek.getMin(); i < seek.getMax(); ++i) {
                    seek.setValue(i);
                    gif.addFrame(canvas, {copy: true, delay: seek.getDelay()});
                }
                gif.on('finished', function (blob) {
                    saveUrlAsLocalFile(URL.createObjectURL(blob), 'canvas.gif');
                });
                gif.render();
                alert('please wait for a while, about 2 minutes.');
            });
        }
    }
}
