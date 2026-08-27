import React from 'react';
import PlayerCvCard from './PlayerCvCard';
import { PlayerCv } from '../types';

export interface PlayerCardProps {
  key?: React.Key;
  player: PlayerCv;
  currentUser?: any;
  isAdmin?: boolean;
  onToggleBeacon?: (playerId: string) => void;
  onEditPlayerCv?: (player: PlayerCv) => void;
  onDeletePlayerCv?: (id: string) => void;
}

export default function PlayerCard(props: PlayerCardProps) {
  return <PlayerCvCard {...props} />;
}
