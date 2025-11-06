package com.braze.reactbridge

import com.braze.models.cards.CaptionedImageCard
import com.braze.models.cards.Card
import com.braze.models.cards.ControlCard
import com.braze.models.cards.ImageOnlyCard
import com.braze.models.cards.ShortNewsCard
import com.braze.models.cards.TextAnnouncementCard
import com.braze.reactbridge.util.getMutableArray
import com.braze.reactbridge.util.getMutableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

fun mapContentCards(cardsList: List<Card>): WritableArray =
    cardsList.fold(getMutableArray()) { array, card ->
        array.apply { pushMap(mapContentCard(card)) }
    }

fun mapContentCard(card: Card): WritableMap {
    val mappedCard = getMutableMap()
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
    val extras = getMutableMap()
    for ((key, value) in card.extras) {
        extras.putString(key, value)
    }
    mappedCard.putMap("extras", extras)

    when (card) {
        is ImageOnlyCard -> mappedCard.merge(card.toWritableMap())
        is CaptionedImageCard -> mappedCard.merge(card.toWritableMap())
        is ShortNewsCard -> mappedCard.merge(card.toWritableMap())
        is TextAnnouncementCard -> mappedCard.merge(card.toWritableMap())
        is ControlCard -> mappedCard.merge(controlCardToWritableMap())
        else -> Unit
    }
    return mappedCard
}

fun CaptionedImageCard.toWritableMap(): WritableMap {
    val mappedCard = getMutableMap()
    mappedCard.putString("image", imageUrl)
    mappedCard.putDouble("imageAspectRatio", aspectRatio.toDouble())
    mappedCard.putString("title", title)
    mappedCard.putString("cardDescription", description)
    mappedCard.putString("domain", domain)
    mappedCard.putString("type", "Captioned")
    return mappedCard
}

fun ShortNewsCard.toWritableMap(): WritableMap {
    val mappedCard = getMutableMap()
    mappedCard.putString("image", imageUrl)
    mappedCard.putString("title", title)
    mappedCard.putString("cardDescription", description)
    mappedCard.putString("domain", domain)
    mappedCard.putString("type", "Classic")
    return mappedCard
}

fun TextAnnouncementCard.toWritableMap(): WritableMap {
    val mappedCard = getMutableMap()
    mappedCard.putString("title", title)
    mappedCard.putString("cardDescription", description)
    mappedCard.putString("domain", domain)
    mappedCard.putString("type", "Classic")
    return mappedCard
}

fun ImageOnlyCard.toWritableMap(): WritableMap {
    val mappedCard = getMutableMap()
    mappedCard.putString("image", imageUrl)
    mappedCard.putDouble("imageAspectRatio", aspectRatio.toDouble())
    mappedCard.putString("type", "ImageOnly")
    return mappedCard
}

fun controlCardToWritableMap(): WritableMap {
    val mappedCard = getMutableMap()
    mappedCard.putString("type", "Control")
    return mappedCard
}
