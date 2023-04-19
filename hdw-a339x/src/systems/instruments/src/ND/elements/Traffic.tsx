/* eslint-disable camelcase */
import { useSimVar } from '@instruments/common/simVars';
import React, { FC, useState, memo, useEffect } from 'react';
import { Layer } from '@instruments/common/utils';
import { TCAS_CONST as TCAS, TaRaIntrusion, TaRaIndex } from '@tcas/lib/TcasConstants';
import { Coordinates } from '@fmgc/flightplanning/data/geo';
import { MathUtils } from '@shared/MathUtils';
import { EfisNdMode, NdTraffic, EfisNdRangeValue, rangeSettings } from '@shared/NavigationDisplay';
import { usePersistentProperty } from '@instruments/common/persistence';
import { useFlowSyncEvent } from '@instruments/common/hooks';
import { MapParameters } from '../utils/MapParameters';

export type TcasProps = {
    mapParams: MapParameters,
    mode: EfisNdMode.ARC | EfisNdMode.ROSE_NAV | EfisNdMode.ROSE_ILS | EfisNdMode.ROSE_VOR,
}

type TcasMask = [number, number][];

const TCAS_MASK_ARC: TcasMask = [
    // ARC
    [-384, -310], [-384, 0], [-264, 0], [-210, 59], [-210, 143],
    [210, 143], [210, 0], [267, -61], [384, -61],
    [384, -310], [340, -355], [300, -390], [240, -431.5],
    [180, -460], [100, -482], [0, -492], [-100, -482],
    [-180, -460], [-240, -431.5], [-300, -390], [-340, -355],
    [-384, -310],
];

const TCAS_MASK_ROSE: TcasMask = [
    // ROSE NAV
    [-340, -227], [-103, -227], [-50, -244],
    [0, -250], [50, -244], [103, -227], [340, -227],
    [340, 180], [267, 180], [210, 241], [210, 383],
    [-210, 383], [-210, 300], [-264, 241], [-340, 241], [-340, -227],
];

const TRAFFIC_SCALE: number[] = [64, 56, 48, 40, 40, 40];

const useAirTraffic = (mapParams, mode) : NdTraffic[] => {
    const [airTraffic, setAirTraffic] = useState<NdTraffic[]>([]);
    const tcasMask = (mode === EfisNdMode.ARC ? TCAS_MASK_ARC : TCAS_MASK_ROSE);
    useFlowSyncEvent('A32NX_TCAS_TRAFFIC', (_topic, data) => {
        if (data) {
            setAirTraffic(trafficToDisplay(data, mapParams, tcasMask));
        }
    });
    useEffect(() => {
        setAirTraffic(trafficToDisplay(airTraffic, mapParams, tcasMask));
    }, [mapParams?.nmRadius, mode]);
    return airTraffic;
};

const trafficToDisplay = (airTraffic, mapParams, tcasMask) => (
    airTraffic.map((traffic: NdTraffic) => {
        const latLong: Coordinates = { lat: traffic.lat, long: traffic.lon };
        let [x, y] = mapParams.coordinatesToXYy(latLong);

        // TODO FIXME: Full time option installed: For all ranges except in ZOOM ranges, NDRange > 9NM
        if (!MathUtils.pointInPolygon(x, y, tcasMask)) {
            if (traffic.intrusionLevel < TaRaIntrusion.TA) {
                traffic.alive = false;
                return traffic;
            }
            const ret: [number, number] | null = MathUtils.intersectWithPolygon(x, y, 0, 0, tcasMask);
            if (ret) [x, y] = ret;
        }
        traffic.alive = true;
        traffic.posX = x;
        traffic.posY = y;
        return traffic;
    })
);

export const Traffic: FC<TcasProps> = ({ mapParams, mode }) => {
    const airTraffic = useAirTraffic(mapParams, mode);
    const [debug] = usePersistentProperty('TCAS_DEBUG', '0');
    const [sensitivity] = useSimVar('L:A32NX_TCAS_SENSITIVITY', 'number', 200);
    const x: number = 361.5;
    const y: number = (mode === EfisNdMode.ARC) ? 606.5 : 368;
    const rangeIndex = rangeSettings.indexOf(mapParams.nmRadius as EfisNdRangeValue);
    const trafficScale = TRAFFIC_SCALE[rangeIndex];
    const ownHeading = Math.round(SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', 'degree'));

    if (debug !== '0') {
        const dmodRa: number = mapParams.nmToPx * (TCAS.DMOD[sensitivity || 1][TaRaIndex.RA]);
        const dmodTa: number = mapParams.nmToPx * (TCAS.DMOD[sensitivity || 1][TaRaIndex.TA]);
        return (
            <Layer x={x} y={y}>
                {dmodTa >= 0
                && (
                    <path
                        d={`M 22.5, 16 m -${dmodTa}, 0 a ${dmodTa},${dmodTa} 0 1,0 ${dmodTa * 2},0 a ${dmodTa},${dmodTa} 0 1,0 -${dmodTa * 2},0`}
                        strokeWidth={2}
                        className="Amber"
                        strokeDasharray="5 2.5"
                    />
                )}
                {dmodRa >= 0
                && (
                    <path
                        d={`M 22.5, 16 m -${dmodRa}, 0 a ${dmodRa},${dmodRa} 0 1,0 ${dmodRa * 2},0 a ${dmodRa},${dmodRa} 0 1,0 -${dmodRa * 2},0`}
                        strokeWidth={2}
                        className="Red"
                        strokeDasharray="6 3"
                    />
                )}
                <text x={290} y={-200} fill="#ffffff" fontSize="12px" height={1.25} strokeWidth={0.3} textAnchor="middle" xmlSpace="preserve">
                    <tspan fill="#ffffff">
                        {`SENSITIVITY: ${sensitivity}`}
                    </tspan>
                    <tspan x={290} dy={15} fill="#ffffff">
                        {'DMOD: '}
                    </tspan>
                    <tspan fill="#e38c56">
                        {dmodTa.toFixed(3)}
                    </tspan>
                    <tspan fill="#ffffff">
                        {' | '}
                    </tspan>
                    <tspan fill="#ff0000">
                        {dmodRa.toFixed(3)}
                    </tspan>
                    <tspan x={290} dy={15} fill="#ffffff">
                        {'TAU THR: '}
                    </tspan>
                    <tspan fill="#e38c56">
                        {TCAS.TAU[sensitivity || 1][TaRaIndex.TA]}
                    </tspan>
                    <tspan fill="#ffffff">
                        {' | '}
                    </tspan>
                    <tspan fill="#ff0000">
                        {TCAS.TAU[sensitivity || 1][TaRaIndex.RA]}
                    </tspan>

                    <tspan x={290} dy={15} fill="#ffffff">
                        {'Z THR: '}
                    </tspan>
                    <tspan fill="#e38c56">
                        {TCAS.ZTHR[sensitivity || 1][TaRaIndex.TA]}
                    </tspan>
                    <tspan fill="#ffffff">
                        {' | '}
                    </tspan>
                    <tspan fill="#ff0000">
                        {TCAS.ZTHR[sensitivity || 1][TaRaIndex.RA]}
                    </tspan>

                    <tspan x={290} dy={15} fill="#ffffff">
                        {'ALIM: '}
                    </tspan>
                    <tspan fill="#ff0000">
                        {TCAS.ALIM[sensitivity]}
                    </tspan>
                </text>
                {airTraffic.map((tf) => (
                    tf.alive ? (
                        <TrafficIndicatorDebug
                            key={tf.ID}
                            x={tf.posX}
                            y={tf.posY}
                            relativeAlt={tf.relativeAlt}
                            vertSpeed={tf.vertSpeed}
                            intrusionLevel={tf.intrusionLevel}
                            ID={tf.ID}
                            hidden={tf.hidden}
                            seen={tf.seen}
                            raTau={tf.raTau && tf.raTau < 200 ? tf.raTau?.toFixed(0) : undefined}
                            taTau={tf.taTau && tf.taTau < 200 ? tf.taTau?.toFixed(0) : undefined}
                            vTau={tf.vTau && tf.vTau < 200 ? tf.vTau?.toFixed(0) : undefined}
                            closureAccel={tf.closureAccel?.toFixed(1)}
                            closureRate={tf.closureRate?.toFixed(1)}

                        />
                    ) : null
                ))}
            </Layer>
        );
    }
    return (
        <Layer x={x} y={y}>
            {airTraffic.map((tf) => (
                tf.alive ? (
                    <TrafficIndicator
                        key={tf.ID}
                        x={tf.posX}
                        y={tf.posY}
                        relativeAlt={tf.relativeAlt}
                        vertSpeed={tf.vertSpeed}
                        intrusionLevel={tf.intrusionLevel}
                        trafficHeading={tf.heading}
                        ownHeading={ownHeading}
                        trafficScale={trafficScale}
                    />
                ) : null
            ))}
        </Layer>

    );
};

type TrafficProp = {
    x: number | undefined,
    y: number | undefined,
    relativeAlt: number | undefined,
    vertSpeed: number | undefined,
    intrusionLevel: TaRaIntrusion | undefined,
    trafficHeading: number | undefined,
    ownHeading: number | undefined,
    trafficScale: number | undefined
}

const TrafficIndicator: FC<TrafficProp> = memo(({ x, y, relativeAlt, vertSpeed, intrusionLevel, trafficHeading, ownHeading , trafficScale}) => {
    if (relativeAlt === undefined || vertSpeed === undefined || x === undefined || y === undefined) return <></>;
    let color = '#ffffff';
    switch (intrusionLevel) {
    case TaRaIntrusion.TA:
        color = '#e38c56';
        break;
    case TaRaIntrusion.RA:
        color = '#ff0000';
        break;
    default:
        break;
    }

    // Place relative altitude above/below
    const relAltY: number = (relativeAlt > 0) ? -10 : (18 + trafficScale);
    const trafficRotation = 360 - ((ownHeading - trafficHeading) % 360);

    return (
        <>
            <Layer x={x} y={y}>
                <g>
                    {intrusionLevel === TaRaIntrusion.TRAFFIC && <image width={trafficScale} height={trafficScale} xlinkHref="/Images/A339X/ND/TRAFFIC_NORMAL.svg" transform={`rotate(${trafficRotation} ${trafficScale / 2} ${trafficScale / 2})`} />}
                    {intrusionLevel === TaRaIntrusion.PROXIMITY && <image width={trafficScale} height={trafficScale} xlinkHref="/Images/A339X/ND/TRAFFIC_PROXIMITY.svg" transform={`rotate(${trafficRotation} ${trafficScale / 2} ${trafficScale / 2})`} />}
                    {intrusionLevel === TaRaIntrusion.TA && <image width={trafficScale} height={trafficScale} xlinkHref="/Images/A339X/ND/TRAFFIC_TA.svg" transform={`rotate(${trafficRotation} ${trafficScale / 2} ${trafficScale / 2})`} />}
                    {intrusionLevel === TaRaIntrusion.RA && <image width={trafficScale} height={trafficScale} xlinkHref="/Images/A339X/ND/TRAFFIC_RA.svg" transform={`rotate(${trafficRotation} ${trafficScale / 2} ${trafficScale / 2})`} />}
                </g>

                <g transform={`translate(12 ${relAltY})`}>
                    <text fill={color} height={1.25} paintOrder="stroke" stroke="#040404" strokeWidth={1} textAnchor="end" xmlSpace="preserve">
                        <tspan fill={color} fontSize="20px" paintOrder="stroke" stroke="#040404" strokeWidth={1} textAnchor="middle">
                            {`${relativeAlt > 0 ? '+' : '-'}${Math.abs(relativeAlt) < 10 ? '0' : ''}${Math.abs(relativeAlt)}`}
                        </tspan>
                    </text>

                    <g transform="translate(14,-19)" >
                    {(vertSpeed <= -500) && (
                        <>
                            <svg width="24" height="24" fill={color} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M469.333 128l85.333 0 0 512-85.333 0 0-512z"  /><path d="M725.333 640l-426.667 0 213.333 256z"  /></svg>
                        </>
                    )}
                    {(vertSpeed >= 500) && (
                        <>
                            <svg width="24" height="24" fill={color} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 128l-213.333 256 170.667 0 0 512 85.333 0 0-512 170.667 0z"  /></svg>
                        </>
                    )}
                    </g>
                </g>
            </Layer>
        </>
    );
});

type TrafficPropDebug = {
    x: number | undefined,
    y: number | undefined,
    relativeAlt: number | undefined,
    vertSpeed: number | undefined,
    intrusionLevel: TaRaIntrusion | undefined,
    ID: string,
    hidden: boolean | undefined,
    seen: number | undefined,
    raTau: string | undefined,
    taTau: string | undefined,
    vTau: string | undefined,
    closureRate: string | undefined,
    closureAccel: string | undefined
}

const TrafficIndicatorDebug: FC<TrafficPropDebug> = memo(({ x, y, relativeAlt, vertSpeed, intrusionLevel, ID, hidden, seen, raTau, taTau, vTau, closureRate, closureAccel }) => {
    if (relativeAlt === undefined || vertSpeed === undefined || x === undefined || y === undefined) return <></>;
    let color = '#ffffff';
    switch (intrusionLevel) {
    case TaRaIntrusion.TA:
        color = '#e38c56';
        break;
    case TaRaIntrusion.RA:
        color = '#ff0000';
        break;
    default:
        break;
    }

    // Place relative altitude above/below
    const relAltY: number = (relativeAlt > 0) ? 7 : 43.5;
    const debugY1: number = (relativeAlt > 0) ? 38 : -1;
    const debugY2: number = (relativeAlt > 0) ? 50 : -13;

    return (
        <>
            <Layer x={x} y={y}>
                {intrusionLevel === TaRaIntrusion.TRAFFIC && <image opacity={hidden ? 0.125 : 1.0} x={0} y={0} width={45} height={32} xlinkHref="/Images/A339X/ND/TRAFFIC_NORMAL.svg" />}
                {intrusionLevel === TaRaIntrusion.PROXIMITY && <image opacity={hidden ? 0.125 : 1.0} x={0} y={0} width={45} height={32} xlinkHref="/Images/A339X/ND/TRAFFIC_PROXIMITY.svg" />}
                {intrusionLevel === TaRaIntrusion.TA && <image opacity={hidden ? 0.125 : 1.0} x={0} y={0} width={45} height={32} xlinkHref="/Images/A339X/ND/TRAFFIC_TA.svg" />}
                {intrusionLevel === TaRaIntrusion.RA && <image opacity={hidden ? 0.125 : 1.0} x={0} y={0} width={45} height={32} xlinkHref="/Images/A339X/ND/TRAFFIC_RA.svg" />}
                <g>
                    <text x={30} y={relAltY} fillOpacity={hidden ? 0.125 : 1} fill={color} height={1.25} strokeWidth={0.3} textAnchor="end" xmlSpace="preserve">
                        <tspan x={17.25} y={relAltY} fill={color} fontSize="20px" strokeWidth={0.3} textAnchor="middle">
                            {`${relativeAlt > 0 ? '+' : '-'}${Math.abs(relativeAlt) < 10 ? '0' : ''}${Math.abs(relativeAlt)}`}
                        </tspan>
                        {!hidden && (
                            <>
                                <tspan x={17.25} y={debugY1} fillOpacity={0.6} fill={color} fontSize="8px" strokeWidth={0.2} textAnchor="middle">
                                    {`${ID} [${closureRate}|${closureAccel}] <${seen}>`}
                                </tspan>
                                <tspan x={17.25} y={debugY2} fill={color} fontSize="12px" strokeWidth={0.2} textAnchor="middle">
                                    {`R ${raTau || '-'} V ${vTau || '-'} T ${taTau || '-'}`}
                                </tspan>
                            </>
                        )}
                    </text>
                    {(vertSpeed <= -500) && (
                        <>
                            <path className="shadow" fill="none" strokeWidth={3} d="M35,21V9.7" />
                            <path className="shadow" stroke="none" fillRule="evenodd" d="M31.3,18.5l3.3,7.1h0.9l3.3-7.1H31.3z" />
                            <path opacity={hidden ? 0.125 : 1} fill="none" stroke={color} strokeWidth={1.6} d="M35,21V9.7" />
                            <path opacity={hidden ? 0.125 : 1} fill={color} stroke="none" fillRule="evenodd" d="M31.3,18.5l3.3,7.1h0.9l3.3-7.1H31.3z" />
                        </>
                    )}
                    {(vertSpeed >= 500) && (
                        <>
                            <path className="shadow" fill="none" strokeWidth={3} d="M35,14.2v11.3" />
                            <path className="shadow" stroke="none" fillRule="evenodd" d="M38.7,16.7l-3.3-7.1h-0.9l-3.3,7.1H38.7z" />
                            <path opacity={hidden ? 0.125 : 1} fill="none" stroke={color} strokeWidth={1.6} d="M35,14.2v11.3" />
                            <path opacity={hidden ? 0.125 : 1} fill={color} stroke="none" fillRule="evenodd" d="M38.7,16.7l-3.3-7.1h-0.9l-3.3,7.1H38.7z" />
                        </>
                    )}
                </g>
            </Layer>
        </>
    );
});
