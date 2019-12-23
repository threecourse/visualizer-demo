import {framework} from "./framework";

export module visualizer {

    class InputData {
        public cells: string[][];
        public commands: number[];
        public sy: number;
        public sx: number;

        constructor(jsonValue: any) {
            this.cells = JSON.parse(jsonValue["cells"]);
            this.commands = JSON.parse(jsonValue["commands"]);
            this.sy = jsonValue["sy"];
            this.sx = jsonValue["sx"];
        }
    }

    export class Tester {
        public frames: TesterFrame[];

        constructor(jsonValue: any) {
            const inputData = new InputData(jsonValue);
            this.frames = [new TesterFrame(0, inputData)];
            for (const cmd of inputData.commands) {
                let lastFrame = this.frames[this.frames.length - 1];
                this.frames.push(new TesterFrame(lastFrame, cmd));
            }
        }
    }

    class TesterFrame {
        public previousFrame: TesterFrame | null;
        public frameAge: number;
        public cells: string[][];
        public x: number;
        public y: number;
        public score: number;

        constructor(dummyInt: number, inputData: InputData);
        constructor(frame: TesterFrame, command: number);
        constructor(something1: any, something2?: any) {
            if (typeof something1 == "number") {
                const data = something2 as InputData;
                this.frameAge = 0;
                // copy
                this.cells = JSON.parse(JSON.stringify(data.cells));
                this.y = data.sy;
                this.x = data.sx;
                this.score = 0;
            } else if (something1 instanceof TesterFrame) {  // successor frame
                const cmd: number = something2 as number;

                this.previousFrame = something1 as TesterFrame;
                this.frameAge = this.previousFrame.frameAge + 1;

                // copy
                this.cells = JSON.parse(JSON.stringify(this.previousFrame.cells));

                this.y = this.previousFrame.y;
                this.x = this.previousFrame.x;
                this.score = this.previousFrame.score;

                // cmdに応じて処理を行っている
                this.cells[this.y][this.x] = '.';
                if (cmd == 0) {
                    this.y -= 1;
                } else if (cmd == 1) {
                    this.x -= 1;
                } else if (cmd == 2) {
                    this.y += 1;
                } else if (cmd == 3) {
                    this.x += 1;
                }

                if (this.cells[this.y][this.x] == 'o')
                    this.score += 1;
                this.cells[this.y][this.x] = 'S';
            }
        }
    }

    export class Visualizer {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private scoreDisplay: HTMLInputElement;

        constructor() {
            this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
            const size = 800;
            this.canvas.height = size;  // pixels
            this.canvas.width = size;  // pixels
            this.ctx = this.canvas.getContext('2d');
            if (this.ctx == null) {
                alert('unsupported browser');
            }

            this.scoreDisplay = <HTMLInputElement>document.getElementById("scoreDisplay");
        }

        public draw(frame: TesterFrame) {

            const cells = frame.cells;
            const H = cells.length;
            const W = cells[0].length;

            // prepare from input
            let minX = 0;
            let maxX = W;
            let minY = 0;
            let maxY = H;
            const size = Math.max(maxX - minX, maxY - minY);
            const offset = -(Math.min(0, minX, minY));
            const scale = this.canvas.height / size;  // height == width
            const transform = (z: number) => {
                return Math.floor((z + offset) * scale);
            };
            const scaling = (a: number) => {
                return a * scale;
            };

            const drawRect = (x: number, y: number, h: number, w: number, color: string) => {
                this.ctx.fillStyle = color;
                this.ctx.strokeStyle = "#444444";
                this.ctx.strokeRect(transform(x), transform(y), scaling(h), scaling(w));
                this.ctx.fillRect(transform(x), transform(y), scaling(h), scaling(w));
            };

            // update the canvas
            const height = this.canvas.height;
            const width = this.canvas.width;
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, width, height);

            // draw entities
            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    const cell = cells[y][x];
                    let color;
                    if (cell == ".") {
                        color = "white";
                    } else if (cell == "#") {
                        color = "black";
                    } else if (cell == 'o') {
                        color = "#009900";
                    } else {
                        color = "#990000";
                    }
                    drawRect(x, y, 1, 1, color)
                }
            }

            this.scoreDisplay.value = frame.score.toString();
        }

        public getCanvas(): HTMLCanvasElement {
            return this.canvas;
        }
    }

}