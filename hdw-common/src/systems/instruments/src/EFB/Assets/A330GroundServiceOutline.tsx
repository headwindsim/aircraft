// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable max-len */
import * as React from 'react';
// viewBox="0 0 777 814"
export const A330GroundServiceOutline = ({
  className,
  fwdLeftStatus,
  fwdRightStatus,
  midLeftStatus,
  midRightStatus,
  aftLeftStatus,
  aftRightStatus,
}: {
  className: string;
  fwdLeftStatus: boolean;
  fwdRightStatus: boolean;
  midLeftStatus: boolean;
  midRightStatus: boolean;
  aftLeftStatus: boolean;
  aftRightStatus: boolean;
}) => (
  <svg
    id="SVG"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="777"
    height="814"
    viewBox="0 0 549 576"
    style={{
      transform: 'rotate(90deg)',
      transformOrigin: 'center center',
    }}
  >
    <g id="g1940">
      <path d="M149.338,265.103l0,45.485" style={{ fill: 'none', stroke: '#4c4c4c', strokeWidth: 1 }} />
      <path d="M170.709,265.103l0,45.528" style={{ fill: 'none', stroke: '#4c4c4c', strokeWidth: 1 }} />
      <path d="M295.066,265.103l0,45.894" style={{ fill: 'none', stroke: '#4c4c4c', strokeWidth: 1 }} />
      <path d="M280.465,265.103l0,45.894" style={{ fill: 'none', stroke: '#4c4c4c', strokeWidth: 1 }} />
      <path d="M57.628,271.092l-0,33.916" style={{ fill: 'none', stroke: '#4c4c4c', strokeWidth: 1 }} />
      <path d="M68.448,268.482l-0,39.136" style={{ fill: 'none', stroke: '#4c4c4c', strokeWidth: 1 }} />
      <path d="M87.744,264.849l-0,45.65" style={{ fill: 'none', stroke: '#4c4c4c', strokeWidth: 1 }} />
      <path d="M403.318,266.907l-0,42.286" style={{ fill: 'none', stroke: '#4c4c4c', strokeWidth: 1 }} />
      <path d="M433.444,271.092l-0,33.744" style={{ fill: 'none', stroke: '#4c4c4c', strokeWidth: 1 }} />
      <path
        d="M72.837,308.287c-0,0 0.795,-2.562 1.276,-4.111c0.207,-0.665 0.863,-1.085 1.554,-0.992c1.578,0.212 4.352,0.585 6.054,0.813c0.384,0.052 0.731,0.258 0.961,0.57c0.229,0.312 0.322,0.705 0.257,1.087c-0.265,1.547 -0.645,3.769 -0.645,3.769"
        style={{
          stroke: '#6bbe45',
          strokeWidth: 2,
          fill: fwdLeftStatus ? '#6bbe45' : 'none',
          strokeMiterlimit: 10,
        }}
      />
      <path
        d="M164.262,310.517c0,-0 0.037,-1.904 0.064,-3.307c0.007,-0.386 -0.141,-0.759 -0.411,-1.035c-0.271,-0.276 -0.641,-0.432 -1.028,-0.432l-7.046,-0c-0.779,-0 -1.416,0.619 -1.439,1.397c-0.041,1.409 -0.1,3.377 -0.1,3.377"
        style={{
          stroke: '#6bbe45',
          strokeWidth: 2,
          fill: midLeftStatus ? '#6bbe45' : 'none',
          strokeMiterlimit: 10,
        }}
      />
      <path
        d="M292.012,310.997c-0,0 0.038,-1.963 0.065,-3.372c0.007,-0.369 -0.135,-0.726 -0.394,-0.989c-0.258,-0.264 -0.612,-0.413 -0.982,-0.413l-7.173,0c-0.744,0 -1.353,0.592 -1.375,1.335c-0.041,1.413 -0.101,3.439 -0.101,3.439"
        style={{ fill: 'none', stroke: '#f00', strokeWidth: 1 }}
      />
      <path
        d="M417.563,307.342c-0,0 -0.145,-2.393 -0.245,-4.045c-0.024,-0.397 -0.211,-0.766 -0.518,-1.019c-0.307,-0.253 -0.705,-0.367 -1.099,-0.315c-1.856,0.246 -4.955,0.657 -6.7,0.889c-0.735,0.097 -1.274,0.739 -1.243,1.479c0.068,1.651 0.178,4.279 0.178,4.279"
        style={{
          stroke: '#6bbe45',
          strokeWidth: 2,
          fill: aftLeftStatus ? '#6bbe45' : 'none',
          strokeMiterlimit: 10,
        }}
      />
      <path
        d="M73.043,267.813c-0,0 0.795,2.561 1.276,4.11c0.207,0.666 0.864,1.085 1.554,0.992c1.578,-0.211 4.352,-0.584 6.054,-0.813c0.385,-0.051 0.731,-0.257 0.961,-0.569c0.23,-0.313 0.322,-0.705 0.257,-1.087c-0.265,-1.547 -0.645,-3.769 -0.645,-3.769"
        style={{
          stroke: '#6bbe45',
          strokeWidth: 2,
          fill: fwdRightStatus ? '#6bbe45' : 'none',
          strokeMiterlimit: 10,
        }}
      />
      <path
        d="M164.468,265.103c0,0 0.037,1.903 0.064,3.307c0.007,0.386 -0.141,0.759 -0.411,1.035c-0.271,0.276 -0.641,0.431 -1.028,0.431l-7.046,0c-0.779,0 -1.416,-0.618 -1.439,-1.396c-0.041,-1.409 -0.099,-3.377 -0.099,-3.377"
        style={{
          stroke: '#6bbe45',
          strokeWidth: 2,
          fill: midRightStatus ? '#6bbe45' : 'none',
          strokeMiterlimit: 10,
        }}
      />
      <path
        d="M292.218,265.103c-0,0 0.038,1.963 0.065,3.371c0.007,0.37 -0.135,0.726 -0.394,0.99c-0.258,0.264 -0.612,0.412 -0.982,0.412l-7.173,0c-0.743,0 -1.353,-0.591 -1.375,-1.335c-0.041,-1.412 -0.101,-3.438 -0.101,-3.438"
        style={{ fill: 'none', stroke: '#f00', strokeWidth: 1 }}
      />
      <path
        d="M417.769,268.758c-0,0 -0.145,2.393 -0.244,4.045c-0.025,0.397 -0.212,0.766 -0.519,1.019c-0.307,0.253 -0.705,0.367 -1.099,0.314c-1.855,-0.246 -4.955,-0.657 -6.7,-0.888c-0.735,-0.097 -1.274,-0.739 -1.243,-1.479c0.069,-1.651 0.178,-4.28 0.178,-4.28"
        style={{
          stroke: '#6bbe45',
          strokeWidth: 2,
          fill: aftRightStatus ? '#6bbe45' : 'none',
          strokeMiterlimit: 10,
        }}
      />
      <path
        d="M411.362,287.594c-0,0 0.377,0.369 1.059,0.504c4.58,0.91 22.914,4.42 33.253,4.42c18.381,0 74.951,-4.924 74.951,-4.924"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M411.362,287.594c-0,0 0.377,-0.454 1.059,-0.59c4.58,-0.91 22.914,-4.419 33.253,-4.419c18.381,0 74.951,5.009 74.951,5.009"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M444.772,287.573c-0,0 0.262,0.186 0.735,0.254c3.18,0.459 15.908,2.229 23.086,2.229c12.76,0 52.032,-2.483 52.032,-2.483"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M444.772,287.573c-0,0 0.262,-0.229 0.735,-0.298c3.18,-0.459 15.908,-2.229 23.086,-2.229c12.76,0 52.032,2.527 52.032,2.527"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M52.21,297.483l-1.148,2.306l3.507,1.419l0.08,-1.47l-0.565,-1.495l-1.874,-0.76Z"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M40.713,288.885l2.954,6.867l3.064,-1.047l-2.823,-5.82l-3.195,0Z"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M46.731,297.884l2.978,1.329l0.964,-2.101l-2.378,-1.36l-2.942,0.922l1.378,1.21Z"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M52.21,278.435l-1.148,-2.307l3.507,-1.418l0.08,1.469l-0.565,1.496l-1.874,0.76Z"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M40.713,287.032l2.954,-6.867l3.064,1.047l-2.823,5.82l-3.195,0Z"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M46.731,278.033l2.978,-1.329l0.964,2.101l-2.378,1.36l-2.942,-0.922l1.378,-1.21Z"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M217.598,352.012c-0,0 0.171,-2.023 -23.142,-2.207c-5.65,-0.045 -9.995,0.765 -12.613,1.439c-1.656,0.517 -2.782,2.052 -2.778,3.786c-0.018,5.205 0.007,16.069 0.02,21.508c0.004,1.917 1.373,3.56 3.259,3.91c3.668,0.706 9.592,1.752 13.222,1.877c16.185,0.554 29.665,-3.238 29.665,-3.238l-0.3,-15.441"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M192.139,310.997c14.418,2.424 20.064,4.405 30.91,5.689c5.205,0.616 22.942,0.251 22.942,0.251c-0,0 16.712,0.242 23.819,-0.326c11.598,-0.928 26.082,-2.911 30.044,-5.614"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M228.754,370.184l-28.142,-0.028c-6.202,-0.34 -9.55,-1.316 -9.653,-3.678c-0.113,-2.611 2.803,-2.966 9.432,-3.936l23.566,-0.103"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M485.095,296.271l27.957,64.881l5.523,0.168" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M496.505,294.059l24.661,75.406c-10.961,-0.557 -20.419,-3.437 -26.12,-12.124l-37.237,-56.28"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M485.095,279.102l27.957,-64.882l5.523,-0.167" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M496.505,281.314l24.661,-75.406c-10.961,0.557 -20.419,3.437 -26.12,12.123l-37.237,56.281"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M283.9,315.865l4.357,47.821l60.139,156.189c5.577,16.184 13.749,28.528 24.641,36.846c-6.46,3.545 -19.51,-3.229 -44.299,-28.383c-0,0 -108.19,-172.669 -132.212,-208.893c-2.692,-4.058 -11.919,-8.448 -11.919,-8.448"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M275.471,316.275l3.768,48.484l34.667,86.087" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M321.735,450.846l-14.782,0l-33.449,-85.903l15.033,-0.716"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M300.509,434.297l6.135,-1.701" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path d="M294.689,418.544l5.165,-1.44" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path d="M287.48,400.595l5.463,-1.757" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path d="M280.75,383.382l5.36,-1.634" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M349.255,522.164l-6.294,0.497l-27.518,-66.164l7.276,-3.317"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M328.39,486.397l6.084,-2.032" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M329.035,528.287l4.25,-0.923l-47.175,-77.789l-5.36,1.963"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M303.569,478.364l-4.686,1.789" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path d="M318.25,502.214l-3.892,2.204" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M278.822,448.522l5.294,-2.909l-47.062,-78.527l-6.962,4.228"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M269.089,420.538l-5.804,3.509" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path d="M253.003,393.361l-6.867,3.14" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M223.744,361.132c-0,0 2.929,-1.792 4.808,-2.941c0.407,-0.249 0.697,-0.65 0.807,-1.115c0.11,-0.465 0.029,-0.954 -0.223,-1.359c-3.934,-6.302 -18.863,-30.223 -23.1,-37.011c-0.699,-1.121 -1.934,-1.792 -3.255,-1.768c-2.927,0.051 -7.839,0.138 -7.839,0.138"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M38.463,278.656l-0,18.347" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M511.825,287.885l-0.087,3.509c0,0 -63.35,11.031 -83.245,14.525c-18.829,3.305 -49.703,5.078 -49.703,5.078l-288.385,-0.138c-25.214,-2.618 -44.103,-7.625 -56.533,-16.589c-2.029,-1.464 -3.699,-2.824 -5.312,-4.425c-0.385,-0.383 -0.766,-1.523 -0.766,-1.523"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M511.825,287.885l-0.087,-3.433c0,0 -63.35,-11.031 -83.245,-14.524c-18.829,-3.306 -49.703,-5.079 -49.703,-5.079l-288.385,0.139c-25.214,2.617 -44.103,7.624 -56.533,16.589c-2.1,1.514 -3.815,2.918 -5.479,4.592c-0.329,0.33 -0.599,1.716 -0.599,1.716"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M225.231,373.575l5.71,-0.18" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M287.037,348.293l5.46,0.033c-0,0 2.351,0.894 2.348,1.477c-0.005,1.506 -2.382,2.019 -2.382,2.019l-5.078,0.289"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M293.965,377.92l5.019,-0.319c-0,0 1.781,0.678 1.779,1.12c-0.004,1.141 -1.805,1.53 -1.805,1.53l-3.849,0.219"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M304.677,405.838l3.671,-0.077c-0,0 1.77,0.705 1.762,1.147c-0.022,1.141 -1.829,1.502 -1.829,1.502l-2.621,0.159"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M315.585,434.297l2.843,0c-0,0 1.771,0.706 1.762,1.147c-0.022,1.141 -1.829,1.502 -1.829,1.502l-1.59,0.048"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M217.598,223.38c-0,0 0.171,2.023 -23.142,2.207c-5.65,0.045 -9.995,-0.765 -12.613,-1.439c-1.656,-0.517 -2.782,-2.052 -2.778,-3.786c-0.018,-5.205 0.007,-16.069 0.02,-21.508c0.004,-1.917 1.373,-3.56 3.259,-3.91c3.668,-0.706 9.592,-1.752 13.222,-1.877c16.185,-0.554 29.665,3.238 29.665,3.238l-0.3,15.441"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M192.139,264.395c14.418,-2.424 20.064,-4.405 30.91,-5.689c5.205,-0.616 22.942,-0.251 22.942,-0.251c-0,0 16.712,-0.242 23.819,0.326c11.598,0.928 26.082,2.911 30.044,5.614"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M228.754,205.208l-28.142,0.028c-6.202,0.34 -9.55,1.316 -9.653,3.678c-0.113,2.611 2.803,2.966 9.432,3.936l23.566,0.103"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M283.397,260.315l4.86,-48.609l60.139,-156.189c5.577,-16.184 13.749,-28.528 24.641,-36.846c-6.46,-3.545 -19.51,3.229 -44.299,28.383c0,0 -108.19,172.669 -132.212,208.893c-2.692,4.058 -11.919,8.448 -11.919,8.448"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M275.471,258.348l3.768,-47.715l34.667,-86.087"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M321.735,124.546l-14.782,0l-33.449,85.903l15.033,0.716"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M300.509,141.095l6.135,1.701" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path d="M294.689,156.848l5.165,1.44" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path d="M287.48,174.797l5.463,1.757" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path d="M280.75,192.01l5.36,1.634" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M349.255,53.228l-6.294,-0.497l-27.518,66.164l7.276,3.317"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M328.39,88.995l6.084,2.032" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M329.035,47.105l4.25,0.923l-47.175,77.789l-5.36,-1.963"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M303.569,97.028l-4.686,-1.789" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path d="M318.25,73.178l-3.892,-2.204" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M278.822,126.87l5.294,2.909l-47.062,78.527l-6.962,-4.228"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M269.089,154.854l-5.804,-3.509" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path d="M253.003,182.031l-6.867,-3.14" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M223.744,214.26c-0,0 2.929,1.791 4.808,2.941c0.407,0.249 0.697,0.65 0.807,1.115c0.11,0.464 0.029,0.954 -0.223,1.359c-3.934,6.302 -18.863,30.223 -23.1,37.011c-0.699,1.12 -1.934,1.792 -3.255,1.768c-2.927,-0.051 -7.839,-0.138 -7.839,-0.138"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path d="M225.231,201.817l5.71,0.18" style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }} />
      <path
        d="M287.037,227.099l5.46,-0.033c-0,0 2.351,-0.894 2.348,-1.477c-0.005,-1.506 -2.382,-2.019 -2.382,-2.019l-5.078,-0.289"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M293.965,197.472l5.019,0.319c-0,0 1.781,-0.678 1.779,-1.12c-0.004,-1.141 -1.805,-1.53 -1.805,-1.53l-3.849,-0.219"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M304.677,169.554l3.671,0.077c-0,0 1.77,-0.705 1.762,-1.147c-0.022,-1.141 -1.829,-1.502 -1.829,-1.502l-2.621,-0.159"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
      <path
        d="M315.585,141.095l2.843,0c-0,0 1.771,-0.706 1.762,-1.147c-0.022,-1.142 -1.829,-1.502 -1.829,-1.502l-1.59,-0.048"
        style={{ fill: 'none', stroke: '#fff', strokeWidth: 1 }}
      />
    </g>
  </svg>
);
