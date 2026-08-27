import React from 'react';
import MatchChallengeCard from './MatchChallengeCard';
import { FriendlyMatch } from '../types';

export interface MatchCardProps {
  key?: React.Key;
  match: FriendlyMatch;
  currentUser?: any;
  isAdmin?: boolean;
  onJoinChallenge: (match: FriendlyMatch) => void;
  onEditMatch?: (match: FriendlyMatch) => void;
  onDeleteMatch?: (id: string) => void;
}

export default function MatchCard(props: MatchCardProps) {
  return <MatchChallengeCard {...props} />;
}
