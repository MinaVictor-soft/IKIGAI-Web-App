import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Dimensions,
  LinearGradient,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTournaments, useTournament, useTournamentBracket } from '../hooks/useApi';
import { useLang } from '../contexts/LangContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../config/constants';
import ConferenceHeader from '../components/ConferenceHeader';

// Responsive helpers for mobile/tablet
const windowWidth = Dimensions.get('window').width;
const isMobile = windowWidth < 768;

export default function TournamentScreen() {
  const { data: tournaments, refetch } = useTournaments();
  const { lang, isRTL } = useLang();
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ConferenceHeader />
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>
          {lang === 'ar' ? '🏆 البطولات' : '🏆 Tournaments'}
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {lang === 'ar' ? 'عرض جميع البطولات والأقواس' : 'View all tournaments & brackets'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {!tournaments || tournaments.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>{lang === 'ar' ? 'لا توجد بطولات' : 'No Tournaments'}</Text>
            <Text style={styles.emptyText}>{lang === 'ar' ? 'ستظهر البطولات هنا' : 'Tournaments will appear here'}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {tournaments.map((tournament: any) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                isSelected={selectedTournament === tournament.id}
                onPress={() => setSelectedTournament(selectedTournament === tournament.id ? null : tournament.id)}
                lang={lang}
                isRTL={isRTL}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function TournamentCard({ tournament, isSelected, onPress, lang, isRTL }: any) {
  const { data: bracket } = useTournamentBracket(isSelected ? tournament.id : '');
  const [activeTab, setActiveTab] = React.useState<'overview' | 'groups' | 'bracket' | 'matches' | 'cuplevels'>('overview');
  
  // Notification badge: Show if tournament has recent updates
  const hasUpdates = tournament.status === 'LIVE' || tournament.status === 'GROUP_STAGE';

  const statusColor = tournament.status === 'PLANNING' ? COLORS.accent
    : tournament.status === 'GROUP_STAGE' ? COLORS.warning
    : tournament.status === 'KNOCKOUT' ? COLORS.primary
    : COLORS.success;

  const statusLabel = tournament.status === 'PLANNING' ? (lang === 'ar' ? '📋 قيد التخطيط' : '📋 Planning')
    : tournament.status === 'GROUP_STAGE' ? (lang === 'ar' ? '📊 المرحلة الجماعية' : '📊 Group Stage')
    : tournament.status === 'KNOCKOUT' ? (lang === 'ar' ? '🔥 مرحلة خروج المغلوب' : '🔥 Knockout')
    : (lang === 'ar' ? '🎉 مكتملة' : '🎉 Completed');

  const TabButton = ({ tab, label, icon }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {icon} {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.card, styles.cardEnhanced]}>
      {hasUpdates && <View style={styles.notificationBadge} />}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.tournamentName, isRTL && styles.textRTL]} numberOfLines={1}>
            {tournament.name || tournament.nameAr || 'Tournament'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {hasUpdates && <Text style={styles.liveBadge}>🔴 LIVE</Text>}
            <MaterialIcons
              name={isSelected ? 'expand-less' : 'expand-more'}
              size={24}
              color={COLORS.primary}
            />
          </View>
        </View>
        <View style={[styles.statusRow, isRTL && styles.rowRTL]}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          {tournament.winner && (
            <View style={styles.championBadge}>
              <Text style={styles.championText}>👑 {tournament.winner.name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {isSelected && (
        <View style={styles.expandedContent}>
          {/* Tab Navigation */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.tabsScroll}
            scrollEnabled={true}
          >
            <View style={styles.tabsContainer}>
              <TabButton tab="overview" label={lang === 'ar' ? 'نظرة عامة' : 'Overview'} icon="📋" />
              {tournament.groups && tournament.groups.length > 0 && (
                <TabButton tab="groups" label={lang === 'ar' ? 'المجموعات' : 'Groups'} icon="📊" />
              )}
              {tournament.tournamentMatches && tournament.tournamentMatches.length > 0 && (
                <TabButton tab="matches" label={lang === 'ar' ? 'المباريات' : 'Matches'} icon="⚽" />
              )}
              <TabButton tab="cuplevels" label={lang === 'ar' ? 'مراحل البطولة' : 'Tournament Stages'} icon="🏆" />
            </View>
          </ScrollView>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardLabel}>{lang === 'ar' ? 'الفرق' : 'Teams'}</Text>
                  <Text style={styles.infoCardValue}>{tournament.numberOfGroups * tournament.teamsPerGroup}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardLabel}>{lang === 'ar' ? 'المجموعات' : 'Groups'}</Text>
                  <Text style={styles.infoCardValue}>{tournament.numberOfGroups}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardLabel}>{lang === 'ar' ? 'الحالة' : 'Status'}</Text>
                  <Text style={styles.infoCardValue}>{tournament.status}</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'groups' && tournament.groups && tournament.groups.length > 0 && (
            <ScrollView style={styles.tabContent} scrollEnabled={true} showsVerticalScrollIndicator={false}>
              {tournament.groups.map((group: any) => (
                <GroupStandings
                  key={group.id}
                  group={group}
                  lang={lang}
                  isRTL={isRTL}
                />
              ))}
            </ScrollView>
          )}

          {activeTab === 'matches' && tournament.tournamentMatches && tournament.tournamentMatches.length > 0 && (
            <ScrollView style={styles.tabContent} scrollEnabled={true} showsVerticalScrollIndicator={false}>
              {/* Pending Matches */}
              {tournament.tournamentMatches.filter((m: any) => m.status === 'SCHEDULED' || m.status === 'LIVE').length > 0 && (
                <View style={styles.matchesSubsection}>
                  <Text style={[styles.matchesSubtitle, isRTL && styles.textRTL]}>
                    {lang === 'ar' ? '⏰ قادمة' : '⏰ Pending'}
                  </Text>
                  {tournament.tournamentMatches
                    .filter((m: any) => m.status === 'SCHEDULED' || m.status === 'LIVE')
                    .map((match: any) => (
                      <MatchRow key={match.id} match={match} lang={lang} isRTL={isRTL} status="pending" />
                    ))}
                </View>
              )}
              
              {/* Completed Matches */}
              {tournament.tournamentMatches.filter((m: any) => m.status === 'COMPLETED').length > 0 && (
                <View style={styles.matchesSubsection}>
                  <Text style={[styles.matchesSubtitle, isRTL && styles.textRTL]}>
                    {lang === 'ar' ? '✓ مكتملة' : '✓ Completed'}
                  </Text>
                  {tournament.tournamentMatches
                    .filter((m: any) => m.status === 'COMPLETED')
                    .map((match: any) => (
                      <MatchRow key={match.id} match={match} lang={lang} isRTL={isRTL} status="completed" />
                    ))}
                </View>
              )}
            </ScrollView>
          )}

          {activeTab === 'cuplevels' && (
            <ScrollView style={styles.tabContent} scrollEnabled={true} showsVerticalScrollIndicator={false}>
              <CupLevelsDisplay tournament={tournament} bracket={bracket} lang={lang} isRTL={isRTL} />
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

function ProfessionalMatchCard({ match, lang, isRTL, isFinal }: any) {
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE';
  
  return (
    <View style={[
      styles.professionalMatchCard,
      isCompleted && styles.matchCompleted,
      isLive && styles.matchLive,
      isFinal && styles.matchFinal
    ]}>
      {/* First Team */}
      <View style={styles.profTeamContainer}>
        <View style={styles.profTeamContent}>
          <Text style={[styles.profTeamName, isRTL && styles.textRTL]} numberOfLines={1}>
            {match.team1?.name || (lang === 'ar' ? 'قريباً' : 'TBD')}
          </Text>
        </View>
        {isCompleted && (
          <Text style={[styles.profScore, styles.scoreWon]}>
            {match.team1Goals ?? '-'}
          </Text>
        )}
      </View>

      {/* vs / status */}
      <View style={styles.profVsContainer}>
        {isCompleted ? (
          <Text style={styles.profVsText}>
            {match.team1Goals === match.team2Goals ? (
              lang === 'ar' ? 'تعادل' : 'Draw'
            ) : (
              lang === 'ar' ? 'مكتملة' : 'Done'
            )}
          </Text>
        ) : isLive ? (
          <Text style={styles.profLiveIndicator}>🔴 LIVE</Text>
        ) : (
          <Text style={styles.profVsText}>vs</Text>
        )}
      </View>

      {/* Second Team */}
      <View style={styles.profTeamContainer}>
        {isCompleted && (
          <Text style={[styles.profScore, styles.scoreWon]}>
            {match.team2Goals ?? '-'}
          </Text>
        )}
        <View style={styles.profTeamContent}>
          <Text style={[styles.profTeamName, isRTL && styles.textRTL]} numberOfLines={1}>
            {match.team2?.name || (lang === 'ar' ? 'قريباً' : 'TBD')}
          </Text>
        </View>
      </View>
    </View>
  );
}

function BracketMatchCard({ match, lang, isRTL }: any) {
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE';
  const isPending = !isCompleted && !isLive;
  const winner = match.winner;
  const team1Won = match.team1Id === match.winnerId;
  const team2Won = match.team2Id === match.winnerId;

  return (
    <View style={[
      styles.bracketMatchCard,
      isCompleted && styles.bracketMatchCompleted,
      isLive && styles.bracketMatchLive
    ]}>
      {/* Match Status Badge */}
      <View style={[styles.statusBadgeSmall, isCompleted && styles.statusCompleted, isLive && styles.statusLive]}>
        <Text style={styles.statusText}>
          {isLive ? '🔴' : isCompleted ? '✓' : '⏳'}
        </Text>
      </View>

      {/* Team 1 */}
      <View style={[styles.bracketTeamRow, team1Won && styles.winnerRow]}>
        <Text style={[styles.bracketTeamName, isRTL && styles.textRTL, team1Won && styles.winnerText]} numberOfLines={1}>
          {match.team1?.name || 'TBD'}
        </Text>
        {isCompleted && (
          <Text style={[styles.bracketScore, team1Won && styles.winnerScore]}>
            {match.team1Goals ?? '-'}
          </Text>
        )}
      </View>

      {/* vs / Divider */}
      <Text style={styles.bracketVs}>vs</Text>

      {/* Team 2 */}
      <View style={[styles.bracketTeamRow, team2Won && styles.winnerRow]}>
        <Text style={[styles.bracketTeamName, isRTL && styles.textRTL, team2Won && styles.winnerText]} numberOfLines={1}>
          {match.team2?.name || 'TBD'}
        </Text>
        {isCompleted && (
          <Text style={[styles.bracketScore, team2Won && styles.winnerScore]}>
            {match.team2Goals ?? '-'}
          </Text>
        )}
      </View>

      {/* Status Text */}
      {isCompleted && (
        <Text style={[styles.statusTextSmall, { marginTop: 8 }]}>
          {lang === 'ar' ? 'مكتملة' : 'Completed'}
        </Text>
      )}
      {isPending && (
        <Text style={[styles.statusTextSmall, styles.pendingText, { marginTop: 8 }]}>
          {lang === 'ar' ? 'قادمة' : 'Pending'}
        </Text>
      )}
      {isLive && (
        <Text style={[styles.statusTextSmall, styles.liveText, { marginTop: 8 }]}>
          {lang === 'ar' ? 'مباشر' : 'LIVE'}
        </Text>
      )}
    </View>
  );
}

function CupLevelsDisplay({ tournament, bracket, lang, isRTL }: any) {
  const stageProgression = [
    { stage: 'PLANNING', label: lang === 'ar' ? 'التخطيط' : 'Planning', icon: '🎯' },
    { stage: 'GROUP_STAGE', label: lang === 'ar' ? 'المجموعات' : 'Groups', icon: '📊' },
    { stage: 'KNOCKOUT', label: lang === 'ar' ? 'خروج المغلوب' : 'Knockout', icon: '⚽' },
    { stage: 'COMPLETED', label: lang === 'ar' ? 'مكتمل' : 'Completed', icon: '🏆' }
  ];

  // Filter out GROUP_STAGE from bracket - only show knockout stages
  const knockoutStages = bracket
    ? Object.entries(bracket).filter(([stage]) => stage !== 'GROUP_STAGE')
    : [];

  const stageDisplayName = (stage: string) => {
    const names: Record<string, { en: string; ar: string; icon: string }> = {
      'ROUND_OF_16': { en: 'Round of 16', ar: 'دور الـ16', icon: '🏟️' },
      'QUARTER_FINAL': { en: 'Quarter Finals', ar: 'ربع النهائي', icon: '🔥' },
      'SEMI_FINAL': { en: 'Semi Finals', ar: 'نصف النهائي', icon: '⚡' },
      'FINAL': { en: 'Final', ar: 'النهائي', icon: '👑' },
      'THIRD_PLACE': { en: '3rd Place', ar: 'المركز الثالث', icon: '🥉' },
    };
    const found = names[stage];
    if (found) return { name: lang === 'ar' ? found.ar : found.en, icon: found.icon };
    return { name: stage.replace(/_/g, ' '), icon: '⚽' };
  };

  const stageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'ROUND_OF_16': '#06B6D4',
      'QUARTER_FINAL': '#8B5CF6',
      'SEMI_FINAL': '#F59E0B',
      'FINAL': '#EF4444',
      'THIRD_PLACE': '#D97706',
    };
    return colors[stage] || COLORS.primary;
  };

  return (
    <View style={styles.cupLevelsSection}>
      {/* Progression Steps */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xs,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
      }}>
        {stageProgression.map((item, index) => {
          const isCompleted = stageProgression.findIndex(s => s.stage === tournament.status) > index;
          const isCurrent = tournament.status === item.stage;
          
          return (
            <React.Fragment key={item.stage}>
              {/* Connecting Line before step (except first) */}
              {index > 0 && (
                <View style={{
                  flex: 1,
                  height: 3,
                  backgroundColor: isCompleted || isCurrent ? COLORS.success : COLORS.border,
                  borderRadius: 2,
                  marginHorizontal: -2,
                }} />
              )}
              <View style={{ alignItems: 'center', width: isMobile ? 60 : 72 }}>
                <View style={[{
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                  borderRadius: isMobile ? 20 : 24,
                  backgroundColor: COLORS.background,
                  borderWidth: 2,
                  borderColor: COLORS.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 4,
                },
                isCurrent && {
                  backgroundColor: COLORS.primary + '25',
                  borderColor: COLORS.primary,
                  borderWidth: 3,
                  boxShadow: `0 0 12px ${COLORS.primary}40`,
                },
                isCompleted && !isCurrent && {
                  backgroundColor: COLORS.success + '20',
                  borderColor: COLORS.success,
                }
                ]}>
                  <Text style={{ fontSize: isMobile ? 18 : 22 }}>{item.icon}</Text>
                </View>
                <Text style={[{
                  fontSize: isMobile ? 9 : 11,
                  fontWeight: '600',
                  color: COLORS.textMuted,
                  textAlign: 'center',
                },
                isCurrent && { color: COLORS.primary, fontWeight: '800' },
                isCompleted && { color: COLORS.success, fontWeight: '700' }
                ]}>
                  {item.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {/* Knockout Bracket */}
      {knockoutStages.length > 0 ? (
        <View>
          {knockoutStages.map(([stage, matches]: [string, any[]], stageIndex: number) => {
            const { name, icon } = stageDisplayName(stage);
            const color = stageColor(stage);
            const allCompleted = (matches as any[]).every((m: any) => m.status === 'COMPLETED');

            return (
              <View key={stage} style={{ marginBottom: SPACING.md }}>
                {/* Stage Header Card */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.sm,
                  paddingHorizontal: SPACING.md,
                  backgroundColor: color + '15',
                  borderRadius: BORDER_RADIUS.md,
                  borderLeftWidth: 4,
                  borderLeftColor: color,
                  marginBottom: SPACING.sm,
                }}>
                  <Text style={{ fontSize: 18, marginRight: SPACING.sm }}>{icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: color, letterSpacing: 0.3 }}>
                      {name}
                    </Text>
                    <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1 }}>
                      {(matches as any[]).length} {lang === 'ar' ? 'مباراة' : (matches as any[]).length === 1 ? 'match' : 'matches'}
                      {allCompleted ? (lang === 'ar' ? ' • مكتملة' : ' • All completed') : ''}
                    </Text>
                  </View>
                  {allCompleted && (
                    <View style={{
                      backgroundColor: COLORS.success + '20',
                      paddingHorizontal: SPACING.sm,
                      paddingVertical: 3,
                      borderRadius: BORDER_RADIUS.full,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.success }}>✓</Text>
                    </View>
                  )}
                </View>

                {/* Match Cards */}
                {(matches as any[]).map((match: any, matchIndex: number) => {
                  const isCompleted = match.status === 'COMPLETED';
                  const isLive = match.status === 'LIVE';
                  const team1Won = isCompleted && match.winnerId === match.team1Id;
                  const team2Won = isCompleted && match.winnerId === match.team2Id;

                  return (
                    <View key={match.id || matchIndex} style={{
                      backgroundColor: COLORS.surface,
                      borderRadius: BORDER_RADIUS.md,
                      marginBottom: SPACING.sm,
                      marginLeft: SPACING.md,
                      borderWidth: 1,
                      borderColor: isLive ? COLORS.error + '80' : COLORS.border,
                      overflow: 'hidden',
                      boxShadow: isLive ? `0 0 8px ${COLORS.error}30` : undefined,
                    }}>
                      {/* Live Banner */}
                      {isLive && (
                        <View style={{
                          backgroundColor: COLORS.error,
                          paddingVertical: 3,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          gap: 4,
                        }}>
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1.5 }}>● LIVE</Text>
                        </View>
                      )}
                      
                      {/* Team 1 Row */}
                      <View style={[{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: SPACING.md,
                        paddingTop: SPACING.sm,
                        paddingBottom: 5,
                      }, isRTL && styles.rowRTL]}>
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: team1Won ? COLORS.success : (team2Won ? COLORS.error + '50' : COLORS.textMuted + '40'),
                          marginRight: SPACING.sm,
                        }} />
                        <Text style={{
                          fontSize: 13,
                          fontWeight: team1Won ? '700' : '500',
                          color: team1Won ? COLORS.text : (team2Won ? COLORS.textMuted : COLORS.text),
                          flex: 1,
                        }} numberOfLines={1}>
                          {team1Won ? '👑 ' : ''}{match.team1?.name || 'TBD'}
                        </Text>
                        <View style={{
                          backgroundColor: team1Won ? COLORS.success + '25' : COLORS.background,
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          borderRadius: BORDER_RADIUS.sm,
                          minWidth: 34,
                          alignItems: 'center',
                        }}>
                          <Text style={{
                            fontSize: 15,
                            fontWeight: '800',
                            color: team1Won ? COLORS.success : COLORS.textSecondary,
                          }}>
                            {match.team1Goals ?? '-'}
                          </Text>
                        </View>
                      </View>

                      {/* VS Divider */}
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: SPACING.md,
                      }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
                        <Text style={{
                          fontSize: 9,
                          fontWeight: '700',
                          color: COLORS.textMuted,
                          paddingHorizontal: SPACING.sm,
                          letterSpacing: 1,
                        }}>VS</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
                      </View>

                      {/* Team 2 Row */}
                      <View style={[{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: SPACING.md,
                        paddingTop: 5,
                        paddingBottom: SPACING.sm,
                      }, isRTL && styles.rowRTL]}>
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: team2Won ? COLORS.success : (team1Won ? COLORS.error + '50' : COLORS.textMuted + '40'),
                          marginRight: SPACING.sm,
                        }} />
                        <Text style={{
                          fontSize: 13,
                          fontWeight: team2Won ? '700' : '500',
                          color: team2Won ? COLORS.text : (team1Won ? COLORS.textMuted : COLORS.text),
                          flex: 1,
                        }} numberOfLines={1}>
                          {team2Won ? '👑 ' : ''}{match.team2?.name || 'TBD'}
                        </Text>
                        <View style={{
                          backgroundColor: team2Won ? COLORS.success + '25' : COLORS.background,
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          borderRadius: BORDER_RADIUS.sm,
                          minWidth: 34,
                          alignItems: 'center',
                        }}>
                          <Text style={{
                            fontSize: 15,
                            fontWeight: '800',
                            color: team2Won ? COLORS.success : COLORS.textSecondary,
                          }}>
                            {match.team2Goals ?? '-'}
                          </Text>
                        </View>
                      </View>

                      {/* Match Footer */}
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: SPACING.md,
                        paddingVertical: 5,
                        backgroundColor: COLORS.background + '80',
                        borderTopWidth: 1,
                        borderTopColor: COLORS.border,
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          <View style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: isCompleted ? COLORS.success : isLive ? COLORS.error : COLORS.accent,
                          }} />
                          <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '600' }}>
                            {isCompleted ? (lang === 'ar' ? 'انتهت' : 'FT') : isLive ? 'LIVE' : (lang === 'ar' ? 'قادمة' : 'Upcoming')}
                          </Text>
                        </View>
                        {match.matchPlace && (
                          <Text style={{ fontSize: 9, color: COLORS.textMuted }}>📍 {match.matchPlace}</Text>
                        )}
                        {match.matchTime && (
                          <Text style={{ fontSize: 9, color: COLORS.textMuted }}>
                            {new Date(match.matchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={{
          padding: SPACING.xl,
          backgroundColor: COLORS.surface,
          borderRadius: BORDER_RADIUS.lg,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: COLORS.border,
        }}>
          <Text style={{ fontSize: 32, marginBottom: SPACING.sm }}>⚽</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 }}>
            {lang === 'ar' ? 'مرحلة خروج المغلوب' : 'Knockout Stage'}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted, textAlign: 'center' }}>
            {lang === 'ar' ? 'ستظهر المباريات بعد انتهاء مرحلة المجموعات' : 'Matches will appear after group stage concludes'}
          </Text>
        </View>
      )}
    </View>
  );
}

function GroupStandings({ group, lang, isRTL }: any) {
  return (
    <View style={styles.groupCard}>
      <Text style={[styles.groupName, isRTL && styles.textRTL]}>
        {group.groupName}
      </Text>
      <View style={[styles.standingRow, styles.headerRow, isRTL && styles.rowRTL]}>
        <Text style={styles.teamCol}>{lang === 'ar' ? 'الفريق' : 'Team'}</Text>
        <Text style={styles.statCol}>P</Text>
        <Text style={styles.statCol}>W</Text>
        <Text style={styles.statCol}>D</Text>
        <Text style={styles.statCol}>L</Text>
        <Text style={styles.statCol}>Pts</Text>
      </View>
      {group.teams && group.teams.map((teamRecord: any, idx: number) => (
        <View key={teamRecord.id} style={[styles.standingRow, isRTL && styles.rowRTL]}>
          <Text style={[styles.teamCol, styles.teamName, isRTL && styles.textRTL]}>
            {idx + 1}. {teamRecord.team?.name}
          </Text>
          <Text style={styles.statCol}>{teamRecord.played}</Text>
          <Text style={styles.statCol}>{teamRecord.won}</Text>
          <Text style={styles.statCol}>{teamRecord.drawn}</Text>
          <Text style={styles.statCol}>{teamRecord.lost}</Text>
          <Text style={[styles.statCol, styles.pointsCol]}>{teamRecord.points}</Text>
        </View>
      ))}
    </View>
  );
}

function MatchRow({ match, lang, isRTL, status }: any) {
  const isPending = status === 'pending' || match.status === 'SCHEDULED' || match.status === 'LIVE';
  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';
  const team1Won = isCompleted && match.winnerId === match.team1Id;
  const team2Won = isCompleted && match.winnerId === match.team2Id;
  
  return (
    <View style={{
      backgroundColor: COLORS.surface,
      borderRadius: BORDER_RADIUS.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: isLive ? COLORS.error + '60' : COLORS.border,
      overflow: 'hidden',
      boxShadow: isLive ? `0 0 10px ${COLORS.error}25` : undefined,
    }}>
      {/* Live Banner */}
      {isLive && (
        <View style={{
          backgroundColor: COLORS.error,
          paddingVertical: 3,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 6,
        }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1.5 }}>LIVE</Text>
        </View>
      )}

      {/* Match Content */}
      <View style={{ padding: SPACING.md }}>
        {/* Team 1 */}
        <View style={[{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6,
        }, isRTL && styles.rowRTL]}>
          <View style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: team1Won ? COLORS.success + '20' : COLORS.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: SPACING.sm,
          }}>
            <Text style={{ fontSize: 14 }}>{team1Won ? '👑' : '⚽'}</Text>
          </View>
          <Text style={{
            flex: 1,
            fontSize: 14,
            fontWeight: team1Won ? '800' : '500',
            color: team1Won ? COLORS.success : (team2Won ? COLORS.textMuted : COLORS.text),
          }} numberOfLines={1}>
            {match.team1?.name || 'TBD'}
          </Text>
          <View style={{
            backgroundColor: team1Won ? COLORS.success + '20' : COLORS.background,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: BORDER_RADIUS.sm,
            minWidth: 36,
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '800',
              color: team1Won ? COLORS.success : COLORS.textSecondary,
            }}>
              {match.team1Goals ?? '-'}
            </Text>
          </View>
        </View>

        {/* VS Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
          <Text style={{ fontSize: 9, fontWeight: '700', color: COLORS.textMuted, paddingHorizontal: 8, letterSpacing: 1 }}>VS</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
        </View>

        {/* Team 2 */}
        <View style={[{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 6,
        }, isRTL && styles.rowRTL]}>
          <View style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: team2Won ? COLORS.success + '20' : COLORS.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: SPACING.sm,
          }}>
            <Text style={{ fontSize: 14 }}>{team2Won ? '👑' : '⚽'}</Text>
          </View>
          <Text style={{
            flex: 1,
            fontSize: 14,
            fontWeight: team2Won ? '800' : '500',
            color: team2Won ? COLORS.success : (team1Won ? COLORS.textMuted : COLORS.text),
          }} numberOfLines={1}>
            {match.team2?.name || 'TBD'}
          </Text>
          <View style={{
            backgroundColor: team2Won ? COLORS.success + '20' : COLORS.background,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: BORDER_RADIUS.sm,
            minWidth: 36,
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '800',
              color: team2Won ? COLORS.success : COLORS.textSecondary,
            }}>
              {match.team2Goals ?? '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        backgroundColor: COLORS.background + '80',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: isCompleted ? COLORS.success : isLive ? COLORS.error : COLORS.accent,
          }} />
          <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '600' }}>
            {isCompleted ? (lang === 'ar' ? 'انتهت' : 'FT') : isLive ? 'LIVE' : (lang === 'ar' ? 'قادمة' : 'Upcoming')}
          </Text>
        </View>
        {match.stage && (
          <Text style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: '500' }}>
            {match.stage.replace(/_/g, ' ')}
          </Text>
        )}
        {match.matchPlace && (
          <Text style={{ fontSize: 9, color: COLORS.textMuted }}>📍 {match.matchPlace}</Text>
        )}
      </View>
    </View>
  );
}

// Responsive helpers for mobile/tablet
const isTablet = windowWidth >= 768 && windowWidth < 1024;

const getResponsiveValue = (mobile: any, tablet: any, desktop: any) => {
  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + '40',
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  cardEnhanced: {
    borderColor: COLORS.primary + '60',
  },
  cardHeader: {
    padding: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + '20',
    backgroundColor: COLORS.surface,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tournamentName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 24,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  championBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  championText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  expandedContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    overflow: 'hidden',
  },
  tabsScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    scrollEnabled: true,
    paddingBottom: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tabButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS,
    backgroundColor: COLORS.background,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary + '10',
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    whiteSpace: 'nowrap',
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    maxHeight: 400,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  infoCardLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  infoCardValue: {
    fontSize: isMobile ? 16 : 20,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  groupsSection: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: SPACING.md,
    letterSpacing: 0.5,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary + '40',
  },
  groupCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  groupName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  standingRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  teamCol: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  teamName: {
    color: COLORS.text,
    fontWeight: '500',
  },
  statCol: {
    width: 32,
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.text,
    fontWeight: '500',
  },
  pointsCol: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bracketSection: {
    marginVertical: SPACING.md,
  },
  bracketScroll: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  bracketContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  stageColumn: {
    minWidth: 160,
    gap: SPACING.md,
  },
  stageName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  bracketMatch: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: SPACING.sm,
    minWidth: 140,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  bracketTeam: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '500',
  },
  bracketScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  matchesSection: {
    marginVertical: SPACING.md,
  },
  matchesSubsection: {
    marginVertical: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.md,
  },
  matchesSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cupLevelsSection: {
    marginVertical: SPACING.sm,
  },
  cupLevelsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  stagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
    minWidth: '100%',
  },
  stageItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.9,
    position: 'relative',
    minWidth: isMobile ? 60 : 80,
  },
  stageCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stageCircleCurrent: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
  },
  stageCircleCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  stageNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#9ca3af',
  },
  stageNumberActive: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  stageName: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 50,
    marginTop: SPACING.xs,
    lineHeight: 12,
  },
  stageNameActive: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  stageLine: {
    position: 'absolute',
    width: 30,
    height: 2,
    backgroundColor: '#d1d5db',
    right: -20,
    top: 22,
    zIndex: 0,
  },
  stageLineActive: {
    backgroundColor: '#10b981',
    height: 3,
  },
  stageLineCurrent: {
    backgroundColor: COLORS.warning,
    height: 3,
  },
  stageRounds: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  stageRoundsActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  knockoutInfoBox: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  infoBoxText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  bracketIndicator: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  bracketText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  knockoutBracketSection: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary + '08',
    borderRadius: BORDER_RADIUS,
    padding: isMobile ? SPACING.sm : SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  bracketTitle: {
    fontSize: isMobile ? 13 : 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: isMobile ? SPACING.sm : SPACING.md,
    textAlign: 'center',
  },
  bracketTreeScroll: {
    marginVertical: isMobile ? SPACING.sm : SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  bracketTreeContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
    padding: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  bracketRound: {
    minWidth: 140,
    alignItems: 'center',
  },
  roundLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  matchesColumn: {
    gap: SPACING.md,
  },
  bracketMatchCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    borderRadius: BORDER_RADIUS,
    padding: SPACING.sm,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bracketMatchCardMid: {
    minWidth: 130,
    borderColor: COLORS.primary + '60',
  },
  bracketTeamSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  bracketTeamSmallFinal: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  bracketVs: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginVertical: SPACING.xs,
    fontWeight: '500',
  },
  bracketVsFinal: {
    fontSize: 16,
    marginVertical: SPACING.xs,
  },
  bracketFinal: {
    minWidth: 140,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  championBox: {
    backgroundColor: COLORS.warning + '20',
    borderWidth: 3,
    borderColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    minWidth: 140,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  championIcon: {
    fontSize: 32,
  },
  championText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.warning,
    textAlign: 'center',
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  matchTeam: {
    flex: 1,
  },
  matchTeamName: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  matchScore: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
    minWidth: 50,
    textAlign: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  matchRowPending: {
    backgroundColor: '#fef08a30',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    paddingLeft: SPACING.sm,
  },
  matchRowCompleted: {
    backgroundColor: '#d1fae530',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    paddingLeft: SPACING.sm,
  },
  matchScorePending: {
    backgroundColor: '#f59e0b40',
    color: '#d97706',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  textRTL: {
    textAlign: 'right',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: COLORS.surface,
    zIndex: 100,
    shadowColor: '#EF4444',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 10,
  },
  liveBadge: {
    backgroundColor: '#EF4444',
    color: 'white',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  // Vertical Bracket Styles
  verticalBracketContainer: {
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  bracketStage: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginVertical: SPACING.sm,
  },
  stageTitleBox: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  stageCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  bracketMatches: {
    gap: SPACING.md,
  },
  verticalMatchCard: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  verticalTeam: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  verticalTeamName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  vsMid: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  arrowDown: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  arrowText: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '800',
  },
  finalCard: {
    borderWidth: 3,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '15',
  },
  championBox: {
    backgroundColor: COLORS.warning + '20',
    borderWidth: 3,
    borderColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
  },
  championIcon: {
    fontSize: 40,
  },
  championName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.warning,
    textAlign: 'center',
  },
  // Professional Match Card Styles
  bracketTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  professionalMatchCard: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  matchCompleted: {
    borderColor: '#10b98130',
    backgroundColor: '#10b98108',
  },
  matchLive: {
    borderColor: '#EF444430',
    backgroundColor: '#EF444408',
    borderWidth: 2,
  },
  matchFinal: {
    borderColor: COLORS.secondary + '50',
    borderWidth: 3,
    backgroundColor: COLORS.secondary + '15',
  },
  profTeamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  profTeamContent: {
    flex: 1,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    minHeight: 40,
  },
  profTeamName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  profScore: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  scoreWon: {
    fontSize: 18,
    fontWeight: '900',
  },
  profVsContainer: {
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profVsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  profLiveIndicator: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
    backgroundColor: '#EF444420',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  // Tournament Progression Section
  tournamentProgressionSection: {
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  stageProgressionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stageProgressItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stageProgressActive: {
    opacity: 1,
  },
  stageProgressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageProgressCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  stageProgressIcon: {
    fontSize: 24,
  },
  stageProgressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  // Bracket Styles - Simplified & Responsive
  roundTitle: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: isMobile ? SPACING.sm : SPACING.md,
    marginBottom: isMobile ? SPACING.sm : SPACING.md,
    paddingHorizontal: isMobile ? SPACING.sm : SPACING.md,
  },
  bracketRoundContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isMobile ? SPACING.sm : SPACING.md,
    paddingHorizontal: isMobile ? SPACING.sm : SPACING.md,
    justifyContent: isMobile ? 'center' : 'space-around',
    alignItems: 'flex-start',
  },
  simpleMatchCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    borderRadius: BORDER_RADIUS.md,
    padding: isMobile ? SPACING.sm : SPACING.md,
    width: isMobile ? '100%' : '45%',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  finalMatchCard: {
    width: isMobile ? '100%' : '60%',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '10',
  },
  teamNameSmall: {
    fontSize: isMobile ? 10 : 11,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  teamNameFinal: {
    fontSize: isMobile ? 12 : 13,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  vs: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  winnerBox: {
    backgroundColor: COLORS.warning + '20',
    borderWidth: 2,
    borderColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  winnerIcon: {
    fontSize: 36,
  },
  winnerName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.warning,
    textAlign: 'center',
  },
  bracketMatchCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: isMobile ? SPACING.sm : SPACING.md,
    width: isMobile ? '100%' : isTablet ? '45%' : '48%',
    gap: SPACING.xs,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bracketMatchCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#10b98110',
  },
  bracketMatchLive: {
    borderColor: '#ef4444',
    backgroundColor: '#ef444410',
  },
  statusBadgeSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 12,
  },
  statusCompleted: {
    backgroundColor: '#10b98130',
  },
  statusLive: {
    backgroundColor: '#ef444430',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bracketTeamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isMobile ? SPACING.xs / 2 : SPACING.xs,
    paddingHorizontal: isMobile ? SPACING.xs : SPACING.sm,
  },
  winnerRow: {
    backgroundColor: '#10b98120',
    borderRadius: BORDER_RADIUS.sm,
  },
  bracketTeamName: {
    fontSize: isMobile ? 10 : 12,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  winnerText: {
    fontWeight: '800',
    color: '#10b981',
  },
  bracketScore: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: '800',
    color: COLORS.secondary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: isMobile ? SPACING.xs : SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    minWidth: isMobile ? 28 : 32,
    textAlign: 'center',
  },
  winnerScore: {
    backgroundColor: '#10b98140',
    color: '#10b981',
    fontWeight: '900',
  },
  bracketVs: {
    fontSize: isMobile ? 9 : 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  statusTextSmall: {
    fontSize: isMobile ? 9 : 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  pendingText: {
    color: COLORS.warning,
  },
  liveText: {
    color: '#ef4444',
    fontWeight: '900',
  },
});
