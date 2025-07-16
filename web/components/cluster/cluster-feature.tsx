'use client';

import { useState } from 'react';
import { AppHero } from '../ui/ui-layout';
import { ClusterUiModal } from './cluster-ui';
import { ClusterUiTable } from './cluster-ui';
import { TokenSwapCard } from '../ui/Swap';

export default function ClusterFeature() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex items-center justify-center h-full">
      <TokenSwapCard
        fromToken={null}
        toToken={null}
        amountFrom={'1000'}
        amountTo={'500'}
        onAmountFromChange={() => {}}
        onSelectFrom={() => {}}
        onSelectTo={() => {}}
        onSwap={() => {}}
        loading={false}
      />
    </div>
  );
}
