import { ClockEvents, EventBus, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { Arinc429Values } from './shared/ArincValueProvider';
import { EwdSimvars } from './shared/EwdSimvarPublisher';
import { Layer } from '../MsfsAvionicsCommon/Layer';

import './style.scss';

interface SlatsProps {
    bus: EventBus;
}
export class Slats extends DisplayComponent<SlatsProps> {
    private targetClass = Subject.create('');

    private targetText = Subject.create('');

    private targetVisible = Subject.create('hidden');

    private targetBox = Subject.create('');

    private targetSF = Subject.create('');

    private slatsClass = Subject.create('');

    private slatsLineClass = Subject.create('');

    private slatsTargetPath = Subject.create('');

    private flapsTargetPath = Subject.create('');

    private slatsPath = Subject.create('');

    private slatsEndX = Subject.create(0);

    private slatsEndY = Subject.create(0);

    private flapsPath = Subject.create('');

    private flapsEndX = Subject.create(0);

    private flapsEndY = Subject.create(0);

    private alphaLockEngaged = Subject.create(false);

    private configClean: boolean = false;

    private config1: boolean = false;

    private config2: boolean = false;

    private config3: boolean = false;

    private configFull: boolean = false;

    private flaps1AutoRetract: boolean = false;

    private slatsOut: boolean = false;

    private flapsOut: boolean = false;

    onAfterRender(node: VNode): void {
        super.onAfterRender(node);

        const sub = this.props.bus.getSubscriber<Arinc429Values & ClockEvents & EwdSimvars>();

        sub.on('slatsFlapsStatus').whenChanged().handle((s) => {
            this.configClean = s.getBitValue(17);
            this.config1 = s.getBitValue(18);
            this.config2 = s.getBitValue(19);
            this.config3 = s.getBitValue(20);
            this.configFull = s.getBitValue(21);
            this.flaps1AutoRetract = s.getBitValue(26);

            const alphaLockEngaged = s.getBitValue(24);
            this.alphaLockEngaged.set(alphaLockEngaged);

            if (this.configClean) {
                this.targetText.set('FLAP   0');
            } else if (this.config1 && this.flaps1AutoRetract) {
                this.targetText.set('FLAP   1');
            } else if (this.config1) {
                this.targetText.set('FLAP 1+F');
            } else if (this.config2) {
                this.targetText.set('FLAP   2');
            } else if (this.config3) {
                this.targetText.set('FLAP   3');
            } else if (this.configFull) {
                this.targetText.set('FULL    ');
            } else {
                this.targetText.set('');
            }

            if (alphaLockEngaged) {
                this.slatsClass.set('Slats GreenPulseNoFill');
                this.slatsLineClass.set('GreenLine GreenPulse');
            } else {
                this.slatsClass.set('Slats');
                this.slatsLineClass.set('GreenPulse');
            }
        });

        sub.on('slatsPosition').whenChanged().handle((s) => {
            const slats = s.valueOr(0);

            this.slatsOut = slats > 6.1;

            const xFactor = -4.5766;
            const yFactor = 1.519;
            const synchroFactor = 0.071;

            let synchroOffset = 0;
            let positionFactor = 0;
            let positionOffset = 0;
            if (slats >= 0 && slats < 251.0) {
                synchroOffset = 0;
                positionFactor = 0.43;
                positionOffset = 0;
            } else if (slats >= 251.0 && slats < 346.0) {
                synchroOffset = 18;
                positionFactor = 1.21;
                positionOffset = 7.94;
            }

            const value = (slats * synchroFactor - synchroOffset) * positionFactor + positionOffset;
            const x = xFactor * value - 18;
            const y = yFactor * value;
            this.slatsPath.set(`M ${x},${y} l -22,7 l -5,14 l 23,-8 Z`);
            this.slatsEndX.set(x);
            this.slatsEndY.set(y);

            if (this.configClean && slats > 6.1) {
                this.slatsTargetPath.set('M -26,23 l 1 7 l 5 -3 Z');
            } else if (this.config1 && (slats < 238.3 || slats > 263.0)) {
                this.slatsTargetPath.set('M -63,34 l 1 7 l 5 -3 Z');
            } else if ((this.config2 || this.config3 || this.configFull) && (slats < 327.2 || slats > 339.5)) {
                this.slatsTargetPath.set('M -96,45 l 1 6 l 4 -3 Z');
            } else {
                this.slatsTargetPath.set('');
            }
        });

        sub.on('flapsPosition').whenChanged().handle((s) => {
            const flaps = s.valueOr(0);

            this.flapsOut = flaps > 73.1;

            const xFactor = 4.71;
            const yFactor = 0.97;
            const synchroFactor = 0.22;
            const synchroConstant = 15.88;

            let synchroOffset = 0;
            let positionFactor = 0;
            let positionOffset = 0;
            if (flaps >= 0 && flaps < 120.5) {
                synchroOffset = 0;
                positionFactor = 0.97;
                positionOffset = 0;
            } else if (flaps >= 120.5 && flaps < 145.5) {
                synchroOffset = 10.63;
                positionFactor = 1.4;
                positionOffset = 10.34;
            } else if (flaps >= 145.5 && flaps < 168.3) {
                synchroOffset = 16.3;
                positionFactor = 1.62;
                positionOffset = 18.27;
            } else if (flaps >= 168.3 && flaps < 355) {
                synchroOffset = 21.19;
                positionFactor = 0.43;
                positionOffset = 26.21;
            }

            const value = Math.max((flaps * synchroFactor - synchroConstant - synchroOffset) * positionFactor + positionOffset, 0);
            const x = xFactor * value;
            const y = yFactor * value + 1;
            this.flapsPath.set(`M${x},${y} l 24.5,6 l 0,13.5 l -18,-4 Z`);
            this.flapsEndX.set(x);
            this.flapsEndY.set(y);

            if ((this.configClean || this.flaps1AutoRetract) && flaps > 73.1) {
                this.flapsTargetPath.set('M 12,23 l -1 7 l -5 -3 Z');
            } else if (this.config1 && !this.flaps1AutoRetract && (flaps < 113.1 || flaps > 122.2)) {
                this.flapsTargetPath.set('M 58,32 l -1 7 l -5 -3 Z');
            } else if (this.config2 && (flaps < 140.4 || flaps > 149.5)) {
                this.flapsTargetPath.set('M 95,40 l -1 7 l -5 -3 Z');
            } else if (this.config3 && (flaps < 163.1 || flaps > 172.2)) {
                this.flapsTargetPath.set('M 133,48 l -1 7 l -5 -3 Z');
            } else if (this.configFull && (flaps < 246.8 || flaps > 257.2)) {
                this.flapsTargetPath.set('M 170,56 l -1 7 l -5 -3 Z');
            } else {
                this.flapsTargetPath.set('');
            }
        });

        sub.on('realTime').handle((_t) => {
            const inMotion = this.slatsTargetPath.get() !== '' || this.flapsTargetPath.get() !== '';
            this.targetVisible.set((this.slatsOut || this.flapsOut || !this.configClean) ? 'visible' : 'hidden');
            this.targetBox.set((this.slatsOut || this.flapsOut || !this.configClean) ? 'GreenBox' : 'WhiteBox');
            this.targetSF.set((this.slatsOut || this.flapsOut || !this.configClean) ? 'SFActive' : 'SFInactive');
            this.targetClass.set(inMotion ? 'Huge Center Pre Cyan' : 'Huge Center Pre Green');
        });
    }

    render(): VNode {
        return (
            <Layer x={539} y={418}>
                <path d="M0, 0l -18,0 l -4,14 l 28,1 Z" className={this.targetBox} />
                <g visibility={this.targetVisible}>
                    <text className={this.targetClass} x={12} y={83}>{this.targetText}</text>
                    <text className="Standard Center" x={-101} y={15}>S</text>
                    <text className="Standard Center" x={105} y={15}>F</text>

                    <circle cx="-68" cy="22" r="3" className="DotsSmallWhite" />
                    <circle cx="-101" cy="33" r="3" className="DotsSmallWhite" />
                    <path d={this.slatsTargetPath} className="SlatsSmallCyan" />

                    <circle cx="63" cy="20" r="3" className="DotsSmallWhite" />
                    <circle cx="100" cy="28" r="3" className="DotsSmallWhite" />
                    <circle cx="138" cy="36" r="3" className="DotsSmallWhite" />
                    <circle cx="175" cy="44" r="3" className="DotsSmallWhite" />
                    <path d={this.flapsTargetPath} className="FlapsSmallCyan" />
                </g>
                <text className="Medium Center GreenPulseNoFill" x={-95} y={-10} visibility={this.alphaLockEngaged.map((v) => (v ? 'visible' : 'hidden'))}>A LOCK</text>

                <path className={this.targetSF} d={this.slatsPath} />
                <line className="GreenLine" x1={-18} y1={0} x2={this.slatsEndX} y2={this.slatsEndY} />

                <path className={this.targetSF} d={this.flapsPath} />
                <line className="GreenLine" x1={0} y1={0} x2={this.flapsEndX} y2={this.flapsEndY} />
            </Layer>
        );
    }
}
