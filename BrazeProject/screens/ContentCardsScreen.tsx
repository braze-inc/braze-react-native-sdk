import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  AppState,
  ViewToken,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Braze from '@braze/react-native-sdk';
import { Button, Toast, useToast } from '../components';
import { Colors } from '../constants/colors';

type ContentCard = Braze.ContentCard;

// 50% visible for 500ms prevents ghost impressions for off-screen cards.
const VIEWABILITY_CONFIG = {
  minimumViewTime: 500,
  itemVisiblePercentThreshold: 50,
};

// Change to `true` to automatically log clicks, impressions, and dismissals
// for all content cards as soon as they appear in the feed.
const automaticallyInteract = false;

interface ContentCardItemProps {
  card: ContentCard;
  onDismiss: (id: string) => void;
  showToast: (message: string) => void;
}

const ContentCardItem: React.FC<ContentCardItemProps> = ({
  card,
  onDismiss,
  showToast,
}) => {
  const handlePress = () => {
    Braze.logContentCardClicked(card.id);
    console.log(`Content card clicked: ${card.id}`);
    showToast('Card clicked');
    if (card.url) {
      Braze.processContentCardClickAction(card.id);
    }
  };

  const handleDismiss = () => {
    Braze.logContentCardDismissed(card.id);
    console.log(`Content card dismissed: ${card.id}`);
    showToast('Card dismissed');
    onDismiss(card.id);
  };

  const renderFullWidthImage = (uri: string, aspectRatio?: number) => (
    <Image
      source={{ uri }}
      style={[styles.fullWidthImage, aspectRatio ? { aspectRatio } : undefined]}
      resizeMode="cover"
    />
  );

  type TextCard = Extract<ContentCard, { title: string }>;

  const renderTextContent = (c: TextCard) => (
    <>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {c.title}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={3}>
        {c.cardDescription}
      </Text>
      {c.domain && <Text style={styles.cardDomain}>{c.domain}</Text>}
    </>
  );

  const renderCardContent = () => {
    switch (card.type) {
      case 'ImageOnly':
        return renderFullWidthImage(card.image, card.imageAspectRatio);
      case 'Classic':
        return (
          <View style={styles.classicContent}>
            {card.image && (
              <Image
                source={{ uri: card.image }}
                style={styles.classicThumbnail}
                resizeMode="cover"
              />
            )}
            <View style={styles.classicText}>{renderTextContent(card)}</View>
          </View>
        );
      case 'Captioned':
        return (
          <>
            {renderFullWidthImage(card.image, card.imageAspectRatio)}
            <View style={styles.captionedText}>{renderTextContent(card)}</View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, !card.viewed && styles.unreadCard]}
      onPress={handlePress}
      activeOpacity={0.85}>
      {card.pinned && (
        <View style={styles.pinnedBadge}>
          <Text style={styles.pinnedText}>PINNED</Text>
        </View>
      )}
      {renderCardContent()}
      {card.dismissible && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export const ContentCardsScreen: React.FC = () => {
  const { toastVisible, message, showToast } = useToast();
  const [cards, setCards] = useState<ContentCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Tracked per-session to prevent duplicate impression logs.
  const impressedCardIds = useRef<Set<string>>(new Set());

  const updateCards = useCallback((incoming: ContentCard[]) => {
    const visible = incoming
      .filter(c => !c.isControl && !c.dismissed && c.type != null)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        return b.created - a.created;
      });
    setCards(visible);
  }, []);

  useEffect(() => {
    Braze.getCachedContentCards().then(updateCards);

    const cardsSubscription = Braze.addListener(
      Braze.Events.CONTENT_CARDS_UPDATED,
      (event: Braze.ContentCardsUpdatedEvent) => {
        updateCards(event.cards);
        setIsLoading(false);
      },
    );

    // On foreground (e.g. returning from ContentCardsActivity), request a server
    // refresh rather than reading the local cache. CONTENT_CARDS_UPDATED can fire
    // during the native Activity's lifecycle with transient data that poisons the
    // cache; a fresh server fetch via the subscription delivers the settled state.
    const appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (nextAppState === 'active') {
          Braze.requestContentCardsRefresh();
        }
      },
    );

    return () => {
      cardsSubscription.remove();
      appStateSubscription.remove();
    };
  }, [updateCards]);

  const handleRefresh = () => {
    setIsLoading(true);
    Braze.requestContentCardsRefresh();
    showToast('Refreshing Content Cards...');
  };

  const handleDismiss = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      for (const { item } of viewableItems) {
        const card = item as ContentCard;
        if (card && !impressedCardIds.current.has(card.id)) {
          impressedCardIds.current.add(card.id);
          Braze.logContentCardImpression(card.id);
          console.log(`Content card impression logged: ${card.id}`);
          if (automaticallyInteract) {
            Braze.logContentCardClicked(card.id);
            Braze.logContentCardDismissed(card.id);
          }
        }
      }
    },
  ).current;

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.screenTitle}>Content Cards</Text>
      <Text style={styles.screenSubtitle}>
        Launch the native UI or browse the custom feed below.
      </Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Default UI</Text>
        <Button
          title="Launch Content Cards"
          onPress={() => Braze.launchContentCards(true)}
        />
        <Button
          title="Request Refresh"
          onPress={handleRefresh}
          variant="secondary"
        />
        {isLoading && (
          <ActivityIndicator style={styles.loader} color={Colors.brazePrimary} />
        )}
      </View>

      <Text style={styles.sectionLabel}>Custom Feed</Text>
    </View>
  );

  const renderEmpty = () =>
    !isLoading ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No Content Cards</Text>
        <Text style={styles.emptySubtitle}>
          Tap Refresh to load cards from Braze.
        </Text>
      </View>
    ) : null;

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <Toast message={message} visible={toastVisible} />
      <FlatList
        data={cards}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ContentCardItem
            card={item}
            onDismiss={handleDismiss}
            showToast={showToast}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.contentContainer}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
      />
    </SafeAreaProvider>
  );
};

const cardShadow = {
  shadowColor: Colors.shadow,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 16,
  },
  loader: {
    marginTop: 8,
  },
  card: {
    ...cardShadow,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.brazePrimary,
  },
  pinnedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.brazeOrange,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  pinnedText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dismissText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  fullWidthImage: {
    width: '100%',
    height: 200,
  },
  classicContent: {
    flexDirection: 'row',
    padding: 16,
  },
  classicThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  classicText: {
    flex: 1,
  },
  captionedText: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textMedium,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardDomain: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
  },
  sectionCard: {
    ...cardShadow,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 4,
  },
});
