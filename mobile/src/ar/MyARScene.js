import React from 'react';
import { ViroARScene, ViroText, ViroBox, ViroMaterials } from 'react-viro';

ViroMaterials.createMaterials({
  box: { diffuseColor: '#4C90D0' },
});

export default class MyARScene extends ViroARScene {
  render() {
    return (
      <>
        <ViroText text="Try On" position={[0, 0, -1]} style={{ color: '#FFFFFF' }} />
        <ViroBox position={[0, -0.5, -1]} scale={[0.2, 0.2, 0.2]} materials={[ 'box' ]} />
      </>
    );
  }
}
