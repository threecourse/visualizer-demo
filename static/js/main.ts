import {framework} from "./framework";
import {visualizer} from "./visualizer"

export class App {
    public loader: framework.Loader;
    public seek: framework.RichSeekBar;
    public visualizer: visualizer.Visualizer;
    public tester: visualizer.Tester;
    public exporter: framework.FileExporter;

    constructor() {
        this.loader = new framework.Loader();
        this.seek = new framework.RichSeekBar();
        this.visualizer = new visualizer.Visualizer();

        // 入力値を元に設定を行う（描画の実行指示も行う）
        this.loader.callback = (jsonValue: any) => {
            this.tester = new visualizer.Tester(jsonValue);
            this.seek.setMinMax(0, this.tester.frames.length - 1);
            this.seek.setValue(0);
            this.seek.play();
        };

        // Testerおよびパラメータを元に描画を行う
        this.seek.callback = (value: number) => {
            if (this.tester !== undefined) {
                this.visualizer.draw(this.tester.frames[value]);
            }
        };


    }
}

window.onload = () => {
    new App();
};
