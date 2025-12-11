import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

// SVG Icons for editors
const VSCodeIcon = () => (
    <svg width="32px" height="32px" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
         data-iconid="452129" data-svgname="Vs code">
        <path
            d="M21.0016 3.11679C21.0016 2.23783 20.0175 2.23782 19.5801 2.34769C20.1924 1.86426 20.9105 1.98147 21.1656 2.12796L27.079 5.02747C27.6424 5.30375 27.9998 5.8786 27.9998 6.50857V25.5831C27.9998 26.2215 27.6329 26.8025 27.058 27.0743L21.4937 29.7054C21.1109 29.8701 20.2799 30.2767 19.5801 29.7053C20.4549 29.8702 20.9287 29.2476 21.0016 28.8264V3.11679Z"
            fill="url(#paint0_linear_87_8101)" id="element_e09d3e5a"></path>
        <path
            d="M19.6512 2.3319C20.1154 2.24017 21.0018 2.28271 21.0018 3.11685V9.68254L3.07359 23.2453C2.76022 23.4824 2.3192 23.443 2.05229 23.1542L0.204532 21.1548C-0.0849358 20.8416 -0.0646824 20.3513 0.249624 20.0633L19.5802 2.34775L19.6512 2.3319Z"
            fill="url(#paint1_linear_87_8101)" id="element_239fa850"></path>
        <path
            d="M21.0018 22.3708L3.07359 8.80801C2.76022 8.57094 2.3192 8.61028 2.05229 8.8991L0.204532 10.8985C-0.0849358 11.2117 -0.0646824 11.702 0.249624 11.9901L19.5802 29.7056C20.455 29.8704 20.9289 29.2478 21.0018 28.8266V22.3708Z"
            fill="url(#paint2_linear_87_8101)" id="element_ea567dbb"></path>
        <defs id="element_b8852d93">
            <linearGradient id="paint0_linear_87_8101" x1="23.79" y1="2" x2="23.79" y2="30"
                            gradientUnits="userSpaceOnUse">
                <stop stopColor="#32B5F1" id="element_068a0cf0"></stop>
                <stop offset="1" stopColor="#2B9FED" id="element_4a322ace"></stop>
            </linearGradient>
            <linearGradient id="paint1_linear_87_8101" x1="21.0018" y1="5.53398" x2="1.0217" y2="22.3051"
                            gradientUnits="userSpaceOnUse">
                <stop stopColor="#0F6FB3" id="element_3643de6f"></stop>
                <stop offset="0.270551" stopColor="#1279B7" id="element_b1b5af8b"></stop>
                <stop offset="0.421376" stopColor="#1176B5" id="element_abdf8b6a"></stop>
                <stop offset="0.618197" stopColor="#0E69AC" id="element_9a41add3"></stop>
                <stop offset="0.855344" stopColor="#0F70AF" id="element_eb774a74"></stop>
                <stop offset="1" stopColor="#0F6DAD" id="element_141726fb"></stop>
            </linearGradient>
            <linearGradient id="paint2_linear_87_8101" x1="1.15522" y1="9.98389" x2="21.0791" y2="26.4808"
                            gradientUnits="userSpaceOnUse">
                <stop stopColor="#1791D2" id="element_c801287d"></stop>
                <stop offset="1" stopColor="#1173C5" id="element_f731b015"></stop>
            </linearGradient>
        </defs>
    </svg>
);

const CursorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" fill-rule="evenodd" height="1em"  viewBox="0 0 24 24" width="1em"><title>Cursor</title><path d="M22.106 5.68L12.5.135a.998.998 0 00-.998 0L1.893 5.68a.84.84 0 00-.419.726v11.186c0 .3.16.577.42.727l9.607 5.547a.999.999 0 00.998 0l9.608-5.547a.84.84 0 00.42-.727V6.407a.84.84 0 00-.42-.726zm-.603 1.176L12.228 22.92c-.063.108-.228.064-.228-.061V12.34a.59.59 0 00-.295-.51l-9.11-5.26c-.107-.062-.063-.228.062-.228h18.55c.264 0 .428.286.296.514z"/></svg>
);

const WebStormIcon = () => (
    <svg width="56" height="56" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs id="element_d0cdd861">
            <linearGradient x1="41.7030965%" y1="1.92488263%" x2="71.8761384%" y2="95.2347418%" id="linearGradient-1">
                <stop stopColor="#00CDD7" offset="28%" id="element_2e419be3">

                </stop>
                <stop stopColor="#2086D7" offset="94%" id="element_cc4ed10f">

                </stop>
            </linearGradient>
            <linearGradient x1="22.4892241%" y1="15.1271186%" x2="82.8771552%" y2="84.7627119%" id="linearGradient-2">
                <stop stopColor="#FFF045" offset="14%" id="element_00a3969d">

                </stop>
                <stop stopColor="#00CDD7" offset="37%" id="element_762a56e6">

                </stop>
            </linearGradient>
            <linearGradient x1="11171%" y1="-27691.7984%" x2="11907%" y2="-28759.6256%" id="linearGradient-3">
                <stop stopColor="#00CDD7" offset="28%" id="element_833fc226">

                </stop>
                <stop stopColor="#2086D7" offset="94%" id="element_5c861a30">

                </stop>
            </linearGradient>
        </defs>
        <g id="element_e541f6a7">
            <polygon fill="url(#linearGradient-1)"
                     points="34.4 231.2 0 26.8 64 0.4 104.4 24.4 142 4.4 219.6 34.4 176 256" id="element_cdd7eeb9">

            </polygon>
            <polygon fill="url(#linearGradient-2)"
                     points="256 86.8 222.8 5.2 163.2 0 70.4 88.8 95.2 203.6 142 236 256 168.4 228 116"
                     id="element_972f77da">

            </polygon>
            <polygon fill="url(#linearGradient-3)" points="204.8 74.4 228 116 256 86.8 235.6 36" id="element_2777b152">

            </polygon>
            <rect fill="#000000" x="48" y="48" width="160" height="160" id="element_d4bf7980">

            </rect>
            <path
                d="M63.2,178 L123.2,178 L123.2,188 L63.2,188 L63.2,178 Z M141.6,125.6 L150,115.2 C156,120 162,123.2 169.6,123.2 C175.6,123.2 179.2,120.8 179.2,116.8 C179.2,113.2 176.8,111.2 166,108.4 C152.8,104.8 144.4,101.2 144.4,88 L144.4,87.6 C144.4,75.6 154,67.6 167.2,67.6 C176.04879,67.5627811 184.649333,70.5236236 191.6,76 L184,87.2 C179.170815,83.4261245 173.316089,81.1957528 167.2,80.8 C162,80.8 158.8,83.2 158.8,86.8 C158.8,91.2 161.6,92.8 172.8,95.6 C186,99.2 193.6,104 193.6,115.6 C193.6,128.8 183.6,136.4 169.6,136.4 C159.323641,136.02223 149.468301,132.220884 141.6,125.6 Z M128.8,68.8 L118.8,107.2 L107.6,68.8 L96.4,68.8 L85.2,107.2 L75.2,68.8 L59.6,68.8 L78.8,135.2 L91.2,135.2 L102,96.8 L112.8,135.2 L125.2,135.2 L144.4,68.8 L128.8,68.8 Z"
                fill="#FFFFFF" id="element_7be5b968">

            </path>
        </g>
    </svg>
);

const SublimeIcon = () => (
    <svg width="32px" height="32px" viewBox="-38 0 332 332" version="1.1" xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid" data-iconid="354408" data-svgname="Sublimetext icon">
        <defs id="element_b35f170e">
            <linearGradient x1="55.1170996%" y1="58.6795405%" x2="63.6801778%" y2="39.5971572%" id="linearGradient-1">
                <stop stopColor="#FF9700" offset="0%" id="element_532938e1">

                </stop>
                <stop stopColor="#F48E00" offset="53%" id="element_b0611d9d">

                </stop>
                <stop stopColor="#D06F00" offset="100%" id="element_d2b3e4dd">

                </stop>
            </linearGradient>
        </defs>
        <g id="element_a6df3820">
            <path
                d="M255.288325,166.794648 C255.288325,162.908052 252.415934,160.666877 248.891046,161.780372 L6.39727934,238.675387 C2.86530029,239.795974 0,243.859878 0,247.73938 L0,326.329461 C0,330.216057 2.86530029,332.464324 6.39727934,331.343737 L248.891046,254.455814 C252.415934,253.335227 255.288325,249.271323 255.288325,245.384729 L255.288325,166.794648 L255.288325,166.794648 Z"
                fill="url(#linearGradient-1)" id="element_9e4b3270">

            </path>
            <path
                d="M5.68434189e-14,164.291056 C5.68434189e-14,168.177652 2.86530029,172.241555 6.39727934,173.362144 L248.926508,250.26425 C252.458487,251.384837 255.323787,249.13657 255.323787,245.257067 L255.323787,166.659893 C255.323787,162.780391 252.458487,158.716487 248.926508,157.595899 L6.39727934,80.693793 C2.86530029,79.5732052 5.68434189e-14,81.8143808 5.68434189e-14,85.7009761 L5.68434189e-14,164.291056 Z"
                fill="#FF9800" id="element_86801098">

            </path>
            <path
                d="M255.288325,5.30235244 C255.288325,1.41575701 252.415934,-0.83251079 248.891046,0.288076943 L6.39727934,77.1759986 C2.86530029,78.2965864 0,82.36049 0,86.2470854 L0,164.837165 C0,168.723761 2.86530029,170.964936 6.39727934,169.851441 L248.891046,92.9564272 C252.415934,91.8358394 255.288325,87.7719358 255.288325,83.8924327 L255.288325,5.30235244 Z"
                fill="#FF9800" id="element_030e5398">

            </path>
        </g>
    </svg>
);

const NeovimIcon = () => (
    <svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"
         data-iconid="306459" data-svgname="Neovim"><title>Neovim
        icon</title>
        <path
            d="M2.902,4.998l3.864,5.754v12.151l-4.207-4.198V5.344L2.902,4.998 M2.97,4.287L2.107,5.158v13.734l5.112,5.101 v-13.38L2.97,4.287L2.97,4.287z M21.858,5.207L16.676,0v13.331l4.335,6.519c0,0,0.882-0.957,0.882-0.957L21.858,5.207z M7.215,0.001 l13.29,20.28L16.786,24L3.489,3.765L7.215,0.001z"
            fill="#006D77"></path>
    </svg>
);

const ExpoIcon = () => (
    <svg fill="#000000" width="46" height="46" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M24.292 15.547c1.968 0.131 3.729-1.213 4.115-3.145-0.475-0.735-1.287-1.177-2.161-1.177-2.272-0.052-3.491 2.651-1.953 4.323zM15.115 4.697l5.359-3.104-1.708-0.963-7.391 4.281 0.589 0.328 1.119 0.629 2.032-1.176zM21.161 1.307c0.089 0.027 0.161 0.1 0.188 0.188l2.484 7.593c0.047 0.131-0.005 0.272-0.125 0.344-1.968 1.156-2.916 3.489-2.317 5.693 0.656 2.391 2.937 3.953 5.401 3.703 0.135-0.011 0.265 0.073 0.307 0.203l2.563 7.803c0.041 0.131-0.011 0.271-0.125 0.344l-7.859 4.771c-0.037 0.021-0.084 0.036-0.131 0.036-0.068 0.016-0.14 0-0.203-0.041l-2.765-1.797c-0.048-0.031-0.084-0.077-0.109-0.129l-5.396-12.896-8.219 4.875c-0.016 0.011-0.037 0.021-0.052 0.032-0.084 0.036-0.183 0.025-0.261-0.021l-1.859-1.093c-0.136-0.073-0.188-0.245-0.115-0.381l7.953-15.749c0.025-0.057 0.077-0.104 0.135-0.131l7.959-4.609c0.088-0.052 0.197-0.057 0.292-0.005zM12.839 6.407l-1.932-1.089-7.693 15.229 1.396 0.823 6.631-9.015c0.063-0.089 0.167-0.136 0.271-0.12 0.104 0.011 0.192 0.077 0.235 0.177l7.228 17.296 1.933 1.251-8.063-24.552zM26.245 16.964c-2.256 0-3.787-2.292-2.923-4.376 0.86-2.083 3.563-2.619 5.156-1.025 0.595 0.593 0.928 1.396 0.928 2.235 0.005 1.749-1.412 3.167-3.161 3.167z"/>
    </svg>
);

const ReactNativeIcon = () => (
    <svg viewBox="0 0 100 100" width="56" height="56">
        <circle cx="50" cy="50" r="10" fill="#61DAFB"/>
        <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#61DAFB" strokeWidth="2"/>
        <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#61DAFB" strokeWidth="2"
                 transform="rotate(60 50 50)"/>
        <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#61DAFB" strokeWidth="2"
                 transform="rotate(120 50 50)"/>
    </svg>
);

const ZedIcon = () => (
    <svg width="32px" height="32px" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.4375 5.625C6.8842 5.625 5.625 6.8842 5.625 8.4375V70.3125H0V8.4375C0 3.7776 3.7776 0 8.4375 0H83.7925C87.551 0 89.4333 4.5442 86.7756 7.20186L40.3642 53.6133H53.4375V47.8125H59.0625V55.0195C59.0625 57.3495 57.1737 59.2383 54.8438 59.2383H34.7392L25.0712 68.9062H68.9062V33.75H74.5312V68.9062C74.5312 72.0128 72.0128 74.5312 68.9062 74.5312H19.4462L9.60248 84.375H81.5625C83.1158 84.375 84.375 83.1158 84.375 81.5625V19.6875H90V81.5625C90 86.2224 86.2224 90 81.5625 90H6.20749C2.44898 90 0.566723 85.4558 3.22438 82.7981L49.46 36.5625H36.5625V42.1875H30.9375V35.1562C30.9375 32.8263 32.8263 30.9375 35.1562 30.9375H55.085L64.9288 21.0938H21.0938V56.25H15.4688V21.0938C15.4688 17.9871 17.9871 15.4688 21.0938 15.4688H70.5538L80.3975 5.625H8.4375Z" fill="#000"/>
    </svg>

);

const XcodeIcon = () => (
    <svg width="800px" height="800px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" data-iconid="374194"
         data-svgname="Xcode"><title>file_type_xcode</title>
        <path
            d="M22.623,13.746c.056-.177.1-.331.145-.484a50.624,50.624,0,0,1,1.645-5.168,1.831,1.831,0,0,1,1.6-1.274c.524-.056,1.08-.1,1.435.4a1.313,1.313,0,0,0,.879.564,2.391,2.391,0,0,1,.524.137c.234.089.323-.008.387-.226.2-.71.411-1.411.621-2.112.234-.8.234-.79-.54-1.064a1.217,1.217,0,0,0-.951-.016,1.269,1.269,0,0,1-1.492-.306,4.342,4.342,0,0,0-1.637-1.056A11.475,11.475,0,0,0,19.6,2.523a5.991,5.991,0,0,0-2.612.951,3.242,3.242,0,0,0-.306.274,14.318,14.318,0,0,1,3.112.032,2.507,2.507,0,0,1,1.774.911,3.774,3.774,0,0,1,.661,2.1,8.227,8.227,0,0,1-.4,3.032c-.306,1.048-.6,2.112-.895,3.161-.04.137-.073.258.113.306C21.567,13.439,22.075,13.585,22.623,13.746Z"
            fill="#235ee1"></path>
        <path
            d="M17.665,29.6a1.192,1.192,0,0,0,1.177-.645,3.335,3.335,0,0,0,.347-.863q1.161-4.8,2.306-9.611c.314-1.33.613-2.661.935-3.991.065-.258,0-.363-.25-.419-.339-.081-.677-.177-1.016-.282-.621-.185-.5-.161-.685.355Q18.193,20.66,15.9,27.17a1.925,1.925,0,0,0-.129.556A1.755,1.755,0,0,0,17.665,29.6Z"
            fill="#235ee1"></path>
        <path
            d="M2.023,10.255c.032.266.065.492.1.71.234,1.548.476,3.1.7,4.644s.46,3.12.685,4.676c.234,1.572.468,3.136.71,4.709.145.992.3,1.983.443,2.983.032.21.1.306.355.266q2.2-.363,4.4-.7c2.1-.331,4.185-.645,6.281-.976.081-.016.145-.113.218-.177-.089-.048-.194-.137-.274-.129-1.145.161-2.282.339-3.427.516-2.314.363-4.628.718-6.934,1.088-.242.04-.323-.016-.355-.25-.137-1.008-.282-2.008-.435-3.007-.331-2.225-.677-4.451-1.008-6.668-.363-2.419-.718-4.846-1.088-7.273-.04-.266.048-.387.314-.419.468-.065.935-.145,1.395-.218,1.9-.306,3.806-.621,5.708-.927L14.8,8.279c1.548-.25,3.088-.5,4.636-.758.726-.121,1.443-.234,2.169-.371.089-.016.153-.145.226-.218-.1-.04-.194-.081-.29-.113-.024-.008-.056.008-.089.016-.9.153-1.806.306-2.7.452-1.9.314-3.806.621-5.708.935-1.774.29-3.548.589-5.321.879-1.822.3-3.644.6-5.467.895C2.055,10.029,1.95,10.085,2.023,10.255Z"
            fill="#235ee1"></path>
        <path
            d="M25,7.578a.876.876,0,0,1-.145-.008,2.651,2.651,0,0,0-.073.613c.089.653.218,1.306.323,1.959.29,1.75.581,3.507.871,5.257s.581,3.507.879,5.257c.185,1.121.379,2.241.564,3.354.032.169,0,.29-.21.323l-4.644.726q-1.1.169-2.2.363c-.065.008-.121.113-.177.177.081.04.153.113.226.113.234-.016.46-.056.685-.089l5.144-.822c.516-.081,1.024-.169,1.58-.258Q26.421,16.04,25,7.578Z"
            fill="#235ee1"></path>
        <path
            d="M18.882,17.737a.3.3,0,0,0,.024-.476c-.508-.6-1-1.209-1.508-1.814-1.411-1.7-2.83-3.411-4.241-5.12a1.157,1.157,0,0,1-.242-.5.759.759,0,0,1,.516-.8.814.814,0,0,1,.984.323c1.387,1.661,2.782,3.322,4.168,4.983.331.4.669.79,1.016,1.2a.3.3,0,0,0,.024-.476c-.556-.661-1.113-1.33-1.669-1.991-1.121-1.338-2.233-2.677-3.362-4a1.115,1.115,0,0,0-1.637-.121,1.051,1.051,0,0,0-.056,1.58q2.612,3.157,5.225,6.305C18.374,17.14,18.624,17.43,18.882,17.737Z"
            fill="#235ee1"></path>
        <path
            d="M13.319,14.342a1.154,1.154,0,0,0-.194-.129c-.556-.21-1.113-.4-1.669-.613-.177-.065-.258,0-.323.153Q9.61,17.5,8.086,21.244c-.081.185-.024.274.145.339.524.21,1.048.411,1.564.645.282.129.4.065.5-.218.968-2.475,1.951-4.942,2.927-7.41C13.246,14.544,13.27,14.463,13.319,14.342Z"
            fill="#235ee1"></path>
        <path
            d="M18.632,17.8c-.4-.508-.774-.927-1.08-1.379-.274-.419-.581-.637-1.088-.427a1.555,1.555,0,0,1-.387.065l-3.233.556a.422.422,0,0,0-.387.274c-.21.6-.435,1.185-.653,1.782a1.449,1.449,0,0,0-.04.258C14.061,18.559,16.3,18.188,18.632,17.8Z"
            fill="#235ee1"></path>
        <path
            d="M9.57,17.084c-1.322.218-2.58.419-3.878.629.089.6.185,1.177.25,1.758.032.25.137.282.363.25.661-.1,1.33-.194,2-.274a.457.457,0,0,0,.411-.29c.242-.581.5-1.161.75-1.742C9.505,17.318,9.521,17.237,9.57,17.084Z"
            fill="#235ee1"></path>
        <path
            d="M23.744,22.115c-.79-.484-1.572-.959-2.427-1.475.032.153.016.331.1.419a1.949,1.949,0,0,0,.54.419c.274.153.564.258.847.4a1.071,1.071,0,0,1,.71.992.79.79,0,0,0,.073.25l.081-.04A.443.443,0,0,0,23.72,23a2.729,2.729,0,0,0,.306-2.314,3.074,3.074,0,0,0-1.532-2.137c-.242-.121-.4-.016-.572.1a.5.5,0,0,0-.242.556A1.859,1.859,0,0,0,22,18.995c.2-.21.387-.161.613-.016A3.213,3.213,0,0,1,23.744,22.115Z"
            fill="#235ee1"></path>
        <path
            d="M7.53,25.493a.493.493,0,0,0,.1.04c.8-1,1.6-2,2.419-3.024-.121-.065-.194-.113-.274-.145-.516-.21-1.032-.4-1.54-.621-.242-.1-.314-.032-.331.218-.065.677-.145,1.355-.218,2.04C7.627,24.5,7.578,25,7.53,25.493Z"
            fill="#235ee1"></path>
        <path
            d="M12.73,11.593a1.044,1.044,0,0,0-.951.653c-.121.3-.234.6-.371.887-.081.169-.056.274.137.339.54.185,1.08.387,1.613.6.194.073.274.008.347-.161.121-.306.258-.613.387-.919a.739.739,0,0,0-.274-1A6.3,6.3,0,0,0,12.73,11.593Z"
            fill="#235ee1"></path>
        <path
            d="M22.188,17.156c.677-.089,1.346-.177,2.008-.282.056-.008.129-.153.121-.218-.081-.532-.177-1.072-.29-1.6a.317.317,0,0,0-.234-.194c-.339.024-.677.073-1.016.129-.169.024-.29.1-.194.347.306-.04.621-.089.935-.113.073-.008.21.056.218.1.089.4.153.822.234,1.25-.524.073-1.016.137-1.5.2C22.293,16.81,22.131,16.85,22.188,17.156Z"
            fill="#235ee1"></path>
        <path
            d="M22.623,13.746c-.54-.161-1.056-.306-1.564-.452-.185-.056-.153-.169-.113-.306.3-1.056.589-2.112.895-3.161a8.249,8.249,0,0,0,.4-3.032,3.731,3.731,0,0,0-.661-2.1A2.507,2.507,0,0,0,19.8,3.788a14.313,14.313,0,0,0-3.112-.032c.1-.089.194-.194.306-.274a5.991,5.991,0,0,1,2.612-.951,11.559,11.559,0,0,1,5.636.613A4.247,4.247,0,0,1,26.88,4.2a1.269,1.269,0,0,0,1.492.306,1.217,1.217,0,0,1,.951.016c.774.274.774.266.54,1.064-.21.7-.419,1.4-.621,2.112-.065.218-.153.306-.387.226a2.391,2.391,0,0,0-.524-.137,1.243,1.243,0,0,1-.879-.564,1.4,1.4,0,0,0-1.435-.4,1.831,1.831,0,0,0-1.6,1.274,50.624,50.624,0,0,0-1.645,5.168C22.728,13.415,22.68,13.56,22.623,13.746Z"
            fill="#235ee1"></path>
        <path
            d="M17.665,29.6a1.755,1.755,0,0,1-1.895-1.871,1.925,1.925,0,0,1,.129-.556q2.286-6.519,4.588-13.021c.177-.516.065-.532.685-.355.339.1.677.2,1.016.282.25.056.314.161.25.419-.323,1.33-.621,2.661-.935,3.991q-1.149,4.8-2.306,9.611a3.335,3.335,0,0,1-.347.863A1.218,1.218,0,0,1,17.665,29.6Z"
            fill="#235ee1"></path>
        <path
            d="M2.023,10.255c-.073-.169.032-.226.242-.258,1.822-.29,3.644-.6,5.467-.895,1.774-.29,3.548-.589,5.321-.879,1.9-.314,3.806-.621,5.708-.935.9-.145,1.806-.3,2.7-.452.032-.008.065-.024.089-.016.1.032.194.073.29.113-.073.073-.137.2-.226.218-.718.137-1.443.25-2.169.371-1.548.25-3.088.5-4.636.758L9.82,9.1q-2.854.472-5.708.927c-.468.073-.927.161-1.395.218-.266.032-.355.153-.314.419.371,2.419.726,4.846,1.088,7.273.331,2.225.677,4.451,1.008,6.668.153,1,.3,2.008.435,3.007.032.234.1.29.355.25,2.306-.371,4.62-.726,6.934-1.088,1.145-.177,2.282-.355,3.427-.516.081-.008.185.081.274.129-.073.065-.137.161-.218.177q-3.132.5-6.281.976-2.2.339-4.4.7c-.25.04-.323-.056-.355-.266-.145-.992-.29-1.983-.443-2.983-.234-1.572-.476-3.136-.71-4.709-.234-1.556-.46-3.12-.685-4.676l-.7-4.644C2.088,10.746,2.055,10.529,2.023,10.255Z"
            fill="#235ee1"></path>
        <path
            d="M25,7.578l2.838,16.98c-.556.089-1.064.177-1.58.258l-5.144.822c-.226.032-.46.073-.685.089-.073.008-.153-.073-.226-.113.056-.065.113-.161.177-.177q1.1-.194,2.2-.363c1.548-.242,3.1-.492,4.644-.726.21-.032.234-.153.21-.323-.185-1.121-.379-2.233-.564-3.354-.29-1.75-.581-3.507-.879-5.257s-.581-3.507-.871-5.257C25.01,9.5,24.889,8.852,24.8,8.2a2.757,2.757,0,0,1,.073-.613A.651.651,0,0,1,25,7.578Z"
            fill="#235ee1"></path>
        <path
            d="M18.882,17.737c-.258-.306-.508-.6-.758-.9q-2.612-3.157-5.225-6.305a1.051,1.051,0,0,1,.056-1.58,1.1,1.1,0,0,1,1.637.121c1.129,1.322,2.241,2.669,3.362,4,.556.661,1.1,1.33,1.669,1.991a.3.3,0,0,1-.024.476c-.347-.411-.685-.806-1.016-1.2C17.2,12.673,15.8,11.013,14.415,9.352a.8.8,0,0,0-.984-.323.75.75,0,0,0-.516.8,1,1,0,0,0,.242.5c1.411,1.709,2.822,3.411,4.241,5.12.5.6,1,1.209,1.508,1.814A.3.3,0,0,1,18.882,17.737Z"
            fill="#235ee1"></path>
        <path
            d="M13.319,14.342c-.04.121-.065.194-.1.274-.976,2.467-1.959,4.934-2.927,7.41-.113.282-.218.347-.5.218-.508-.234-1.04-.435-1.564-.645-.177-.073-.226-.153-.145-.339q1.536-3.737,3.048-7.49c.065-.161.145-.226.323-.153.556.21,1.113.4,1.669.613A.675.675,0,0,1,13.319,14.342Zm-1.9-.4c-.137.347-.266.653-.387.959q-1.246,3.06-2.5,6.12c-.1.242-.048.339.177.419a9.788,9.788,0,0,1,.951.387c.242.121.339.073.435-.177.629-1.613,1.266-3.217,1.911-4.83.306-.766.6-1.532.919-2.33C12.416,14.31,11.94,14.133,11.416,13.939Z"
            fill="#235ee1"></path>
        <path
            d="M18.632,17.8c-2.33.387-4.572.75-6.861,1.129a1.585,1.585,0,0,1,.04-.258c.218-.6.452-1.185.653-1.782a.411.411,0,0,1,.387-.274l3.233-.556A2.042,2.042,0,0,0,16.471,16c.508-.2.806.016,1.088.427C17.858,16.882,18.229,17.293,18.632,17.8Zm-6.418.734c1.967-.323,3.878-.645,5.829-.968-.347-.435-.645-.822-.959-1.2a.373.373,0,0,0-.282-.089c-.282.032-.556.081-.83.129-.959.161-1.919.323-2.87.5-.121.024-.3.1-.339.194C12.561,17.551,12.4,18.019,12.214,18.535Z"
            fill="#235ee1"></path>
        <path
            d="M9.57,17.084c-.048.153-.073.234-.1.314-.25.581-.508,1.161-.75,1.742a.437.437,0,0,1-.411.29c-.669.081-1.33.169-2,.274-.226.032-.331,0-.363-.25-.073-.572-.161-1.145-.25-1.758C6.99,17.5,8.247,17.3,9.57,17.084Zm-.5.411c-.968.153-1.862.29-2.741.443-.089.016-.234.161-.234.234a7.733,7.733,0,0,0,.161,1.04.278.278,0,0,0,.218.145c.548-.065,1.1-.137,1.637-.226a.446.446,0,0,0,.3-.153C8.642,18.511,8.836,18.027,9.07,17.495Z"
            fill="#235ee1"></path>
        <path
            d="M23.744,22.115a3.175,3.175,0,0,0-1.129-3.12.413.413,0,0,0-.613.016,2.461,2.461,0,0,1-.323.218.5.5,0,0,1,.242-.556.487.487,0,0,1,.572-.1A3.074,3.074,0,0,1,24.026,20.7a2.729,2.729,0,0,1-.306,2.314.443.443,0,0,1-.056.073c-.016.016-.032.016-.081.04a1.078,1.078,0,0,1-.073-.25,1.071,1.071,0,0,0-.71-.992c-.282-.137-.581-.242-.847-.4a1.983,1.983,0,0,1-.54-.419c-.081-.089-.065-.266-.1-.419C22.172,21.155,22.954,21.631,23.744,22.115Z"
            fill="#235ee1"></path>
        <path
            d="M7.53,25.493c.048-.5.089-.992.145-1.492.073-.677.161-1.355.218-2.04.024-.25.089-.323.331-.218.508.218,1.024.411,1.54.621.081.032.153.081.274.145-.822,1.024-1.621,2.024-2.419,3.024A.786.786,0,0,1,7.53,25.493Zm.411-.935c.024.008.048.008.065.016.508-.645,1.008-1.282,1.532-1.951-.476-.185-.887-.347-1.33-.524C8.118,22.953,8.03,23.76,7.941,24.558Z"
            fill="#235ee1"></path>
        <path
            d="M12.73,11.593a5.524,5.524,0,0,1,.887.4.739.739,0,0,1,.274,1c-.129.306-.266.6-.387.919-.065.169-.153.234-.347.161-.532-.21-1.072-.4-1.613-.6-.194-.065-.21-.169-.137-.339.129-.29.242-.6.371-.887A1.031,1.031,0,0,1,12.73,11.593Zm-.984,1.6c.468.177.911.347,1.346.492.048.016.161-.056.194-.121.113-.234.2-.476.314-.718a.4.4,0,0,0-.137-.556,2.65,2.65,0,0,0-.734-.3.52.52,0,0,0-.629.339C11.98,12.609,11.876,12.875,11.747,13.2Z"
            fill="#235ee1"></path>
        <path
            d="M22.188,17.156c-.065-.306.1-.347.282-.371.484-.065.968-.129,1.5-.2-.081-.427-.145-.839-.234-1.25-.008-.048-.145-.113-.218-.1-.314.024-.629.073-.935.113-.089-.25.032-.323.194-.347.339-.048.677-.1,1.016-.129a.3.3,0,0,1,.234.194q.169.8.29,1.6c.008.065-.073.21-.121.218C23.534,16.979,22.873,17.06,22.188,17.156Z"
            fill="#235ee1"></path>
        <path
            d="M11.416,13.939c.524.194,1,.363,1.508.548-.314.8-.621,1.564-.919,2.33-.637,1.613-1.282,3.217-1.911,4.83-.1.25-.2.3-.435.177a8.107,8.107,0,0,0-.951-.387c-.226-.081-.274-.177-.177-.419q1.258-3.06,2.5-6.12C11.15,14.592,11.271,14.286,11.416,13.939Z"
            fill="#235ee1"></path>
        <path
            d="M12.214,18.535c.194-.516.347-.976.54-1.427.04-.1.218-.169.339-.194.959-.177,1.919-.339,2.87-.5.274-.048.556-.1.83-.129a.384.384,0,0,1,.282.089c.314.379.621.766.959,1.2C16.092,17.89,14.182,18.2,12.214,18.535Z"
            fill="#235ee1"></path>
        <path
            d="M9.07,17.495c-.234.532-.427,1.016-.661,1.475a.446.446,0,0,1-.3.153c-.54.089-1.088.161-1.637.226-.073.008-.21-.081-.218-.145a7.354,7.354,0,0,1-.161-1.04c-.008-.073.137-.218.234-.234C7.207,17.785,8.1,17.648,9.07,17.495Z"
            fill="#235ee1"></path>
        <path
            d="M7.941,24.558c.089-.806.177-1.6.274-2.459.435.169.855.339,1.33.524-.524.669-1.032,1.306-1.532,1.951A.235.235,0,0,1,7.941,24.558Z"
            fill="#235ee1"></path>
        <path
            d="M11.747,13.2c.129-.323.234-.589.355-.855A.524.524,0,0,1,12.73,12a2.424,2.424,0,0,1,.734.3.406.406,0,0,1,.137.556c-.1.234-.2.484-.314.718-.032.056-.145.137-.194.121C12.65,13.544,12.214,13.375,11.747,13.2Z"
            fill="#235ee1"></path>
    </svg>
);

// Hero Section
function HomepageHeader() {
    return (
        <header className={styles.heroBanner}>
            <div className={styles.heroContent}>
                <Heading as="h1" className={styles.heroTitle}>
                    Click-to-Source for React Native
                </Heading>
                <p className={styles.heroSubtitle}>
                    Tap any component in your app to instantly jump to its source code in your favorite editor
                </p>
                <div className={styles.buttons}>
                    <Link className={styles.primaryButton} to="/docs">
                        Get Started
                    </Link>
                    <Link
                        className={styles.secondaryButton}
                        href="https://github.com/VaheSaroyan/react-native-dev-inspector"
                    >
                        GitHub
                    </Link>
                </div>
            </div>
        </header>
    );
}

// Features Section
const features = [
    {
        icon: '🎯',
        title: 'Click to Inspect',
        description: 'Tap any component to see its source location, styles, and component hierarchy.',
    },
    {
        icon: '🚀',
        title: 'Instant Navigation',
        description: 'Jump directly to the exact line of code in your IDE with one click.',
    },
    {
        icon: '📦',
        title: 'Zero Production Overhead',
        description: 'Babel plugin only adds metadata in development. No impact on production builds.',
    },
    {
        icon: '🔧',
        title: 'Auto Editor Detection',
        description: 'Automatically detects VS Code, Cursor, WebStorm, and other running editors.',
    },
];

function FeaturesSection() {
    return (
        <section className={styles.features}>
            <div className="container">
                <Heading as="h2" className={styles.sectionTitle}>
                    Developer Experience First
                </Heading>
                <p className={styles.sectionSubtitle}>
                    Speed up your development workflow with powerful inspection tools
                </p>
                <div className={styles.featureGrid}>
                    {features.map((feature, idx) => (
                        <div key={idx} className={styles.featureCard}>
                            <div className={styles.featureIcon}>{feature.icon}</div>
                            <Heading as="h3" className={styles.featureTitle}>
                                {feature.title}
                            </Heading>
                            <p className={styles.featureDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Platforms Section
const platforms = [
    {name: 'Expo', icon: ExpoIcon},
    {name: 'React Native', icon: ReactNativeIcon},
];

function PlatformsSection() {
    return (
        <section className={styles.integrations}>
            <div className="container">
                <Heading as="h2" className={styles.sectionTitle}>
                    Works With Your Stack
                </Heading>
                <p className={styles.sectionSubtitle}>
                    Seamless integration with Expo and bare React Native projects
                </p>
                <div className={styles.logoGrid}>
                    {platforms.map((platform, idx) => (
                        <div key={idx} className={styles.logoItem}>
                            <platform.icon/>
                            <span className={styles.logoName}>{platform.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Editors Section
const editors = [
    {name: 'VS Code', icon: VSCodeIcon},
    {name: 'Cursor', icon: CursorIcon},
    {name: 'WebStorm', icon: WebStormIcon},
    {name: 'Sublime', icon: SublimeIcon},
    {name: 'Neovim', icon: NeovimIcon},
    {name: 'Zed', icon: ZedIcon},
    {name: 'Xcode', icon: XcodeIcon},
];

function EditorsSection() {
    return (
        <section className={styles.features}>
            <div className="container">
                <Heading as="h2" className={styles.sectionTitle}>
                    Supported Editors
                </Heading>
                <p className={styles.sectionSubtitle}>
                    Open source files in your favorite code editor
                </p>
                <div className={styles.logoGrid}>
                    {editors.map((editor, idx) => (
                        <div key={idx} className={styles.logoItem}>
                            <editor.icon/>
                            <span className={styles.logoName}>{editor.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Pipeline Section
function PipelineSection() {
    return (
        <section className={styles.pipeline}>
            <div className={styles.pipelineContainer}>
                <Heading as="h2" className={styles.sectionTitle}>
                    How It Works
                </Heading>
                <p className={styles.sectionSubtitle}>
                    Three-step process from tap to editor
                </p>
                <div className={styles.pipelineSteps}>
                    <div className={styles.pipelineStep}>
                        <div className={styles.stepNumber}>1</div>
                        <Heading as="h3" className={styles.stepTitle}>
                            Build Time
                        </Heading>
                        <p className={styles.stepDescription}>
                            Babel plugin injects source location metadata into JSX elements during compilation
                        </p>
                        <div className={styles.stepCode}>@rn-dev-inspector/babel-plugin</div>
                    </div>
                    <div className={styles.pipelineStep}>
                        <div className={styles.stepNumber}>2</div>
                        <Heading as="h3" className={styles.stepTitle}>
                            Runtime
                        </Heading>
                        <p className={styles.stepDescription}>
                            Inspector component captures taps and extracts source info from the React fiber tree
                        </p>
                        <div className={styles.stepCode}>{"<Inspector>"}</div>
                    </div>
                    <div className={styles.pipelineStep}>
                        <div className={styles.stepNumber}>3</div>
                        <Heading as="h3" className={styles.stepTitle}>
                            Dev Server
                        </Heading>
                        <p className={styles.stepDescription}>
                            Metro middleware receives the request and launches your editor at the correct file:line
                        </p>
                        <div className={styles.stepCode}>@rn-dev-inspector/metro-plugin</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Quick Start Section
function QuickStartSection() {
    return (
        <section className={styles.quickStart}>
            <div className="container">
                <Heading as="h2" className={styles.sectionTitle}>
                    Quick Start
                </Heading>
                <p className={styles.sectionSubtitle}>
                    Get up and running in minutes
                </p>
                <div className={styles.quickStartGrid}>
                    <div className={styles.quickStartCard}>
                        <Heading as="h3" className={styles.quickStartTitle}>
                            <ExpoIcon/> Expo
                        </Heading>
                        <pre className={styles.codeBlock}>
              <code>npx expo install react-native-dev-inspector @rn-dev-inspector/expo-plugin</code>
            </pre>
                    </div>
                    <div className={styles.quickStartCard}>
                        <Heading as="h3" className={styles.quickStartTitle}>
                            <ReactNativeIcon/> React Native CLI
                        </Heading>
                        <pre className={styles.codeBlock}>
              <code>npm install react-native-dev-inspector @rn-dev-inspector/babel-plugin @rn-dev-inspector/metro-plugin</code>
            </pre>
                    </div>
                </div>
                <div className="text--center margin-top--xl">
                    <Link className={styles.ctaButton} to="/docs/getting-started/installation">
                        View Full Installation Guide
                    </Link>
                </div>
            </div>
        </section>
    );
}

// Demo Section
function DemoSection() {
    return (
        <section className={styles.demo}>
            <div className="container">
                <Heading as="h2" className={styles.sectionTitle}>
                    See It In Action
                </Heading>
                <p className={styles.sectionSubtitle}>
                    Watch how easy it is to inspect and navigate to source code
                </p>
                <div className={styles.demoContainer}>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={styles.demoVideo}
                    >
                        <source src="/react-native-dev-inspector/video/demo.mp4" type="video/mp4"/>
                    </video>
                </div>
            </div>
        </section>
    );
}

// CTA Section
function CTASection() {
    return (
        <section className={styles.cta}>
            <div className="container">
                <Heading as="h2" className={styles.ctaTitle}>
                    Ready to speed up your workflow?
                </Heading>
                <p className={styles.ctaSubtitle}>
                    Start inspecting your React Native components today
                </p>
                <Link className={styles.ctaButton} to="/docs">
                    Get Started Now
                </Link>
            </div>
        </section>
    );
}

export default function Home(): ReactNode {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout
            title="Click-to-Source for React Native"
            description="Click on any React Native component to jump to its source code in your IDE"
        >
            <HomepageHeader/>
            <main>
                <DemoSection/>
                <FeaturesSection/>
                <PlatformsSection/>
                <EditorsSection/>
                <PipelineSection/>
                <QuickStartSection/>
                <CTASection/>
            </main>
        </Layout>
    );
}
