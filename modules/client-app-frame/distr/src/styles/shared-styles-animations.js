import { css } from 'lit'

export const fadeInFrames = css`
  @-webkit-keyframes fadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  @-moz-keyframes fadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  @-o-keyframes fadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes fadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
`

export const fromBottomFrames = css`
  @-webkit-keyframes fromBottom {
    from {bottom: -300px; opacity: 0}
    to {bottom: 0; opacity: 1}
  }
  @-moz-keyframes fromBottom {
    from {bottom: -300px; opacity: 0}
    to {bottom: 0; opacity: 1}
  }
  @-o-keyframes fromBottom {
    from {bottom: -300px; opacity: 0}
    to {bottom: 0; opacity: 1}
  }
  @keyframes fromBottom {
    from {bottom: -300px; opacity: 0}
    to {bottom: 0; opacity: 1}
  }
`

export const fromTopFrames = css`
  @-webkit-keyframes fromTop {
    from {top: -100%; opacity: 0}
    to {top: 0; opacity: 1}
  }
  @-moz-keyframes fromTop {
    from {top: -100%; opacity: 0}
    to {top: 0; opacity: 1}
  }
  @-o-keyframes fromTop {
    from {top: -100%; opacity: 0}
    to {top: 0; opacity: 1}
  }
  @keyframes fromTop {
    from {top: -100%; opacity: 0}
    to {top: 0; opacity: 1}
  }
`

export const hoverShadowFrames = css`
@-webkit-keyframes hoverShadow {
  0% {box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);}
  100% {box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);}
}
@-moz-keyframes hoverShadow {
  0% {box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);}
  100% {box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);}
}
@-o-keyframes hoverShadow {
  0% {box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);}
  100% {box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);}
}
@keyframes hoverShadow {
  0% {box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);}
  100% {box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);}
}

@-webkit-keyframes hoverShadowOut {
  from{box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);}
  to {box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);}
}
@-moz-keyframes hoverShadowOut {
  from {box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);}
  to {box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);}
}
@-o-keyframes hoverShadowOut {
  from {box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);}
  to {box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);}
}
@keyframes hoverShadowOut {
  from {box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);}
  to {box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);}
}

`

export const spinnerRipple = css`
  @keyframes lds-ripple {
    0% {
      top: 28px;
      left: 28px;
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      top: -1px;
      left: -1px;
      width: 58px;
      height: 58px;
      opacity: 0;
    }
  }
`

export const rotateFrames = css`
  @-webkit-keyframes rotate {
    0%   { transform: rotate(360deg) }
  }
  @-moz-keyframes fadeIn {
    0%   { opacity: rotate(360deg); }
  }
  @-o-keyframes fadeIn {
    0%   { opacity: rotate(360deg); }
  }
  @keyframes fadeIn {
    0%   { opacity: rotate(360deg); }
  }
`

export const zeroHeightFrames = css`
  @-webkit-keyframes zeroHeight {
    0%   {transform: scaleY(1);}
    100% {transform: scaleY(0);}
  }
  @-moz-keyframes zeroHeight {
    0%   {transform: scaleY(1);}
    100% {transform: scaleY(0);}
  }
  @-o-keyframes zeroHeight {
    0%   {transform: scaleY(1);}
    100% {transform: scaleY(0);}
  }
  @keyframes zeroHeight {
    0%   {transform: scaleY(1);}
    100% {transform: scaleY(0);}
  }
`

export const flashFrames = css`
 @-webkit-keyframes flash {
    0%   {opacity: 0}
    70% {opacity: 0.3;}
    100% {opacity: 0;}
  }

  @-moz-keyframes flash {
    0%   {opacity: 0}
    70% {opacity: 0.3;}
    100% {opacity: 0;}
  }

  @-o-keyframes flash {
    0%   {opacity: 0}
    70% {opacity: 0.3;}
    100% {opacity: 0;}
  }

  @keyframes flash {
    0%   {opacity: 0}
    70% {opacity: 0.3;}
    100% {opacity: 0;}
  }
`
