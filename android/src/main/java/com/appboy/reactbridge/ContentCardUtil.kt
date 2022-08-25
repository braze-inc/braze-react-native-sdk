package com.appboy.reactbridge

import com.appboy.enums.CardType
import com.appboy.models.cards.*
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

    // Extras
    val extras = Arguments.createMap()
    for ((key, value) in card.extras) {
        extras.putString(key, value)
    }
    mappedCard.putMap("extras", extras)
    when (card.cardType) {
        CardType.BANNER -> mappedCard.merge(bannerImageCardToWritableMap(card as BannerImageCard))
        CardType.CAPTIONED_IMAGE -> mappedCard.merge(captionedImageCardToWritableMap(card as CaptionedImageCard))
        CardType.SHORT_NEWS -> mappedCard.merge(shortNewsCardToWritableMap(card as ShortNewsCard))
        CardType.TEXT_ANNOUNCEMENT -> mappedCard.merge(textAnnouncementCardToWritableMap(card as TextAnnouncementCard))
        CardType.DEFAULT, CardType.CONTROL -> {}
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

fun bannerImageCardToWritableMap(card: BannerImageCard): WritableMap {
    val mappedCard = Arguments.createMap()
    mappedCard.putString("image", card.imageUrl)
    mappedCard.putDouble("imageAspectRatio", card.aspectRatio.toDouble())
    mappedCard.putString("domain", card.domain)
    mappedCard.putString("type", "Banner")
    return mappedCard
}
