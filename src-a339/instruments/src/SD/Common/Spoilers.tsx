import React from 'react';
import { useArinc429Var } from '@instruments/common/arinc429';
import { Arinc429Word } from '@shared/arinc429';
import { ComponentPositionProps } from './ComponentPositionProps';
import { ComponentSidePositionProps } from './ComponentSidePositionProps';
import { SvgGroup } from './SvgGroup';

export const Spoilers = ({ x, y }: ComponentPositionProps) => {
    const fcdc1DiscreteWord3 = useArinc429Var('L:A32NX_FCDC_1_DISCRETE_WORD_3');
    const fcdc2DiscreteWord3 = useArinc429Var('L:A32NX_FCDC_2_DISCRETE_WORD_3');
    const fcdc1DiscreteWord4 = useArinc429Var('L:A32NX_FCDC_1_DISCRETE_WORD_4');
    const fcdc2DiscreteWord4 = useArinc429Var('L:A32NX_FCDC_2_DISCRETE_WORD_4');

    const fcdcWord3ToUse = !fcdc1DiscreteWord3.isFailureWarning() ? fcdc1DiscreteWord3 : fcdc2DiscreteWord3;
    const fcdcWord4ToUse = !fcdc1DiscreteWord4.isFailureWarning() ? fcdc1DiscreteWord4 : fcdc2DiscreteWord4;

    return (
        <SvgGroup x={x} y={y}>
            <Spoiler x={0} y={30} side="left" identifier={6} number={5} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
            <Spoiler x={45} y={24} side="left" identifier={5} number={5} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
            <Spoiler x={90} y={18} side="left" identifier={4} number={4} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
            <Spoiler x={135} y={12} side="left" identifier={3} number={3} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
            <Spoiler x={180} y={6} side="left" identifier={2} number={2} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
            <Spoiler x={225} y={0} side="left" identifier={1} number={1} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />

            <Spoiler x={330} y={0} side="right" identifier={1} number={1} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
            <Spoiler x={375} y={6} side="right" identifier={2} number={2} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
            <Spoiler x={420} y={12} side="right" identifier={3} number={3} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
            <Spoiler x={465} y={18} side="right" identifier={4} number={4} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
            <Spoiler x={510} y={24} side="right" identifier={5} number={5} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
            <Spoiler x={555} y={30} side="right" identifier={6} number={5} fcdcWord3={fcdcWord3ToUse} fcdcWord4={fcdcWord4ToUse} />
        </SvgGroup>
    );
};

interface SpoilerProps extends ComponentPositionProps, ComponentSidePositionProps {
    identifier: number,
    number: number,
    fcdcWord3: Arinc429Word,
    fcdcWord4: Arinc429Word
}
const Spoiler = ({ x, y, identifier, number, side, fcdcWord3, fcdcWord4 }: SpoilerProps) => {
    const availAndValidBit = 20 + number;
    const isAvail = fcdcWord3.getBitValueOr(availAndValidBit, false);
    const isPosValid = fcdcWord4.getBitValueOr(availAndValidBit, false);

    const spoilerOutIndex = 9 + number * 2 + (side === 'left' ? 0 : 1);
    const isSpoilerOut = fcdcWord4.getBitValueOr(spoilerOutIndex, false);

    return (
        <SvgGroup x={x} y={y}>
            <path
                visibility={isPosValid ? 'visible' : 'hidden'}
                className={`${isAvail ? 'GreenLine' : 'AmberLine'}`}
                d={`M 0 0 l ${side === 'right' ? '-' : ''}19 0`}
            />
            <path
                visibility={isSpoilerOut && isPosValid ? 'visible' : 'hidden'}
                className={`${isAvail ? 'GreenLine' : 'AmberLine'}`}
                d={`M 0 -31 l ${side === 'left' ? 19 : -19} 0 l ${side === 'left' ? -9.5 : 9.5} -16 z`}
            />
            <path
                visibility={isSpoilerOut && isAvail && isPosValid ? 'visible' : 'hidden'}
                className="GreenLine"
                d={`M ${side === 'left' ? 9.5 : -9.5} 0 l 0 -31`}
            />
            <text
                x={side === 'left' ? 12 : -7}
                y={isPosValid ? -4 : -12}
                visibility={isAvail && isPosValid ? 'hidden' : 'visible'}
                className={`Amber ${isPosValid ? 'Huge' : 'Large'} Center`}
            >
                {isPosValid ? identifier : 'X'}
            </text>
        </SvgGroup>
    );
};
