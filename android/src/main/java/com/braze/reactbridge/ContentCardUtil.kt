package com.braze.reactbridge

import com.braze.enums.CardType
import com.braze.models.cards.Card
import com.braze.models.cards.CaptionedImageCard
import com.braze.models.cards.ImageOnlyCard
import com.braze.models.cards.ShortNewsCard
import com.braze.models.cards.TextAnnouncementCard
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

fun mapContentCards(cardsList: List<Card>): WritableArray {
    val cards = Arguments.createArray()
    for (card in cardsList.toTypedArray()) {
        cards.pushMap(mapContentCard(card))
    }
    return cards
}

fun mapContentCard(card: Card): WritableMap {
    val mappedCard = Arguments.createMap()
    mappedCard.putString("id", card.id)
    mappedCard.putDouble("created", card.created.toDouble())
    mappedCard.putDouble("expiresAt", card.expiresAt.toDouble())
    mappedCard.putBoolean("viewed", card.viewed)
    mappedCard.putBoolean("clicked", card.isClicked)
    mappedCard.putBoolean("pinned", card.isPinned)
    mappedCard.putBoolean("dismissed", card.isDismissed)
    mappedCard.putBoolean("dismissible", card.isDismissibleByUser)
    mappedCard.putString("url", card.url)
    mappedCard.putBoolean("openURLInWebView", card.openUriInWebView)
    mappedCard.putBoolean("isControl", card.isControl)

    // Extras
    val extras = Arguments.createMap()
    for ((key, value) in card.extras) {
        extras.putString(key, value)
    }
    mappedCard.putMap("extras", extras)
    when (card.cardType) {
        CardType.IMAGE -> mappedCard.merge(imageOnlyCardToWritableMap(card as ImageOnlyCard))
        CardType.CAPTIONED_IMAGE -> mappedCard.merge(captionedImageCardToWritableMap(card as CaptionedImageCard))
        CardType.SHORT_NEWS -> mappedCard.merge(shortNewsCardToWritableMap(card as ShortNewsCard))
        CardType.TEXT_ANNOUNCEMENT -> mappedCard.merge(textAnnouncementCardToWritableMap(card as TextAnnouncementCard))
        CardType.CONTROL -> mappedCard.merge(controlCardToWritableMap())
        CardType.DEFAULT -> {}
    }
    return mappedCard
}

fun captionedImageCardToWritableMap(card: CaptionedImageCard): WritableMap {
    val mappedCard = Arguments.createMap()
    mappedCard.putString("image", card.imageUrl)
    mappedCard.putDouble("imageAspectRatio", card.aspectRatio.toDouble())
    mappedCard.putString("title", card.title)
    mappedCard.putString("cardDescription", card.description)
    mappedCard.putString("domain", card.domain)
    mappedCard.putString("type", "Captioned")
    return mappedCard
}

fun shortNewsCardToWritableMap(card: ShortNewsCard): WritableMap {
    val mappedCard = Arguments.createMap()
    mappedCard.putString("image", card.imageUrl)
    mappedCard.putString("title", card.title)
    mappedCard.putString("cardDescription", card.description)
    mappedCard.putString("domain", card.domain)
    mappedCard.putString("type", "Classic")
    return mappedCard
}

fun textAnnouncementCardToWritableMap(card: TextAnnouncementCard): WritableMap {
    val mappedCard = Arguments.createMap()
    mappedCard.putString("title", card.title)
    mappedCard.putString("cardDescription", card.description)
    mappedCard.putString("domain", card.domain)
    mappedCard.putString("type", "Classic")
    return mappedCard
}

fun imageOnlyCardToWritableMap(card: ImageOnlyCard): WritableMap {
    val mappedCard = Arguments.createMap()
    mappedCard.putString("image", card.imageUrl)
    mappedCard.putDouble("imageAspectRatio", card.aspectRatio.toDouble())
    mappedCard.putString("type", "ImageOnly")
    return mappedCard
}

fun controlCardToWritableMap(): WritableMap {
    val mappedCard = Arguments.createMap()
    mappedCard.putString("type", "Control")
    return mappedCard
}
