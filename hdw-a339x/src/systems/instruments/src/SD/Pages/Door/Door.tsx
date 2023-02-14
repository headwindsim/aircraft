import React from 'react';
import { useSimVar } from '../../../Common/simVars';

import './Door.scss';

export const DoorPage = () => {
    const [cabin] = useSimVar('INTERACTIVE POINT OPEN:0', 'percent', 1000);
    const [catering] = useSimVar('INTERACTIVE POINT OPEN:1', 'percent', 1000);
    const [cargo] = useSimVar('INTERACTIVE POINT OPEN:2', 'percent', 1000);
    const [oxygen] = useSimVar('L:PUSH_OVHD_OXYGEN_CREW', 'bool', 1000);
    const [slides] = useSimVar('L:A32NX_SLIDES_ARMED', 'bool', 1000);
    const [cockpit] = useSimVar('L:A32NX_COCKPIT_DOOR_LOCKED', 'bool', 1000);

    return (
        <>
            {/* This is already in an svg so we should remove the containing one - TODO remove style once we are not in the Asobo ECAM */}
                <svg id="door-page" viewBox="0 0 600 600" style={{ marginTop: '-60px' }} xmlns="http://www.w3.org/2000/svg">
                    <g id="fuselage">
                        <path className="MainShape" d="M 267 473 l -5 -13 l 0 -340 C 260,102 276,52 300,40" />
                        <path className="MainShape" d="M 333 473 l 5 -13 l 0 -340 C 340,102 324,52 300,40" />
                        <line className="MainShape" x1="262" y1="225" x2="160" y2="260" />
                        <line className="MainShape" x1="338" y1="225" x2="440" y2="260" />
                    </g>

                    <g id="hatches">
                        <path id="DoorCockpit" className={cockpit ? 'DoorShape' : 'WarningShape'} d="M295 105 l0 -15 l9 0 l0 15Z" />
                        <path id="DoorFwdCargo" className={!cargo ? 'DoorShape' : 'WarningShape'} d="M336 185 l0 -20 l-18 0 l0 20Z" />
                        <path id="DoorAftCargo" className={!cargo ? 'DoorShape' : 'WarningShape'} d="M336 385 l0 -20 l-18 0 l0 20Z" />
                        <path id="DoorBulkCargo" className={!cargo ? 'DoorShape' : 'WarningShape'} d="M328 415 l0 -22 l-8 0 l0 22Z" />
                    </g>

                    <g id="slides">
                        <path id="DoorFwdLeft" className="DoorShape" d="M264 145 l0 -20 l12 0 l0 20Z" />
                        <path id="DoorFwdRight" className={catering > 20 ? 'WarningShape' : 'DoorShape'} d="M336 145 l0 -20 l-12 0 l0 20Z" />
                        <path id="DoorFwdMiddleLeft" className={cabin > 20 ? 'WarningShape' : 'DoorShape'} d="M264 220 l0 -20 l12 0 l0 20Z" />
                        <path id="DoorFwdMiddleRight" className="DoorShape" d="M336 220 l0 -20 l-12 0 l0 20Z" />
                        <path id="DoorAftMiddleLeft" className="DoorShape" d="M264 344 l0 -20 l12 0 l0 20Z" />
                        <path id="DoorAftMiddleRight" className="DoorShape" d="M336 344 l0 -20 l-12 0 l0 20Z" />
                        <path id="DoorAftLeft" className="DoorShape" d="M264 445 l0 -20 l12 0 l0 20Z" />
                        <path id="DoorAftRight" className="DoorShape" d="M336 445 l0 -20 l-12 0 l0 20Z" />
                    </g>

                    <g id="dashes">
                        <path id="DoorFwdLeftDash" strokeDasharray="7,4" d="M138, 136 l121 0" />
                        <path id="DoorFwdRightDash" className={catering > 20 ? 'WarningShape' : 'Hide'} strokeDasharray="7,4" d="M346, 136 l77 0" />
                        <path id="DoorFwdMiddleLeftDash" className={cabin > 20 ? 'WarningShape' : 'Hide'} strokeDasharray="7,4" d="M138, 210 l121 0" />
                        <path id="DoorFwdMiddleRightDash" strokeDasharray="7,4" d="M346, 210 l77 0" />
                        <path id="DoorAftMiddleLeftDash" strokeDasharray="7,4" d="M138, 335 l121 0" />
                        <path id="DoorAftMiddleRightDash" strokeDasharray="7,4" d="M346, 335 l77 0" />
                        <path id="DoorAftLeftDash" strokeDasharray="7,4" d="M138, 438 l121 0" />
                        <path id="DoorAftRightDash" strokeDasharray="7,4" d="M346, 438 l77 0" />

                        <path id="FwdCargoDoorDash" className={!cargo ? 'Hide' : 'WarningShape'} strokeDasharray="7,4" d="M346, 175 l77 0" />
                        <path id="AftCargoDoorDash" className={!cargo ? 'Hide' : 'WarningShape'} strokeDasharray="7,4" d="M346, 375 l77 0" />
                        <path id="BulkCargoDoorDash" className={!cargo ? 'Hide' : 'WarningShape'} strokeDasharray="7,4" d="M346, 405 l77 0" />
                    </g>

                    {/* Texts */}
                    <g id="texts">
                        <text id="PageTitle" className="Title" x="300" y="16" textAnchor="middle" alignmentBaseline="central" textDecoration="underline">DOOR/OXY</text>

                        <text id="slide1" className={slides ? 'Slide' : 'Hide'} x="232" y="136" textAnchor="middle" alignmentBaseline="central">SLIDE</text>
                        <text id="slide2" className={slides ? 'Slide' : 'Hide'} x="368" y="136" textAnchor="middle" alignmentBaseline="central">SLIDE</text>
                        <text id="slide3" className={slides ? 'Slide' : 'Hide'} x="232" y="210" textAnchor="middle" alignmentBaseline="central">SLIDE</text>
                        <text id="slide4" className={slides ? 'Slide' : 'Hide'} x="368" y="210" textAnchor="middle" alignmentBaseline="central">SLIDE</text>
                        <text id="slide5" className={slides ? 'Slide' : 'Hide'} x="232" y="335" textAnchor="middle" alignmentBaseline="central">SLIDE</text>
                        <text id="slide6" className={slides ? 'Slide' : 'Hide'} x="368" y="335" textAnchor="middle" alignmentBaseline="central">SLIDE</text>
                        <text id="slide7" className={slides ? 'Slide' : 'Hide'} x="232" y="438" textAnchor="middle" alignmentBaseline="central">SLIDE</text>
                        <text id="slide8" className={slides ? 'Slide' : 'Hide'} x="368" y="438" textAnchor="middle" alignmentBaseline="central">SLIDE</text>

                        <text id="FwdDoorLeftCabin" x="103" y="136" textAnchor="middle" alignmentBaseline="central">CABIN</text>
                        <text id="FwdDoorRightCabin" className={catering > 20 ? 'Warning' : 'Hide'} x="455" y="136" textAnchor="middle" alignmentBaseline="central">CABIN</text>
                        <text id="FwdMiddleDoorLeftCabin" className={cabin > 20 ? 'Warning' : 'Hide'} x="103" y="210" textAnchor="middle" alignmentBaseline="central">CABIN</text>
                        <text id="FwdMiddleDoorRightCabin" x="455" y="210" textAnchor="middle" alignmentBaseline="central">CABIN</text>
                        <text id="AftMiddleDoorLeftCabin" x="103" y="335" textAnchor="middle" alignmentBaseline="central">CABIN</text>
                        <text id="AftMiddleDoorRightCabin" x="455" y="335" textAnchor="middle" alignmentBaseline="central">CABIN</text>
                        <text id="AftLeftDoorCabin" x="103" y="438" textAnchor="middle" alignmentBaseline="central">CABIN</text>
                        <text id="AftRightDoorCabin" x="455" y="438" textAnchor="middle" alignmentBaseline="central">CABIN</text>
                        <text id="FwdCargoDoor" className={!cargo ? 'Hide' : 'Warning'} x="455" y="175" textAnchor="middle" alignmentBaseline="central">CARGO</text>
                        <text id="AftCargoDoor" className={!cargo ? 'Hide' : 'Warning'} x="455" y="375" textAnchor="middle" alignmentBaseline="central">CARGO</text>
                        <text id="BulkCargoDoor" className={!cargo ? 'Hide' : 'Warning'} x="455" y="405" textAnchor="middle" alignmentBaseline="central">BULK</text>

                        <text
                            id="oxy"
                            className={oxygen ? 'OxyWarn' : 'Oxygen'}
                            x="490"
                            y="18"
                            textAnchor="middle"
                            alignmentBaseline="central"
                        >
                            CKPT OXY
                        </text>

                        <text id="psi_val" className="Value" x="432" y="42" textAnchor="middle" alignmentBaseline="central">1700</text>
                        <text id="psi_unit" className="Unit" x="486" y="43" textAnchor="middle" alignmentBaseline="central">PSI</text>
                        <text id="psi_val_right" className="Value" x="538" y="42" textAnchor="middle" alignmentBaseline="central">1700</text>
                    </g>
                </svg>

        </>
    );
};
