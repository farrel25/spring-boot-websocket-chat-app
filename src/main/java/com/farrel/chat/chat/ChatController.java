package com.farrel.chat.chat;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Objects;

@Controller
public class ChatController {

    // the url to invoke this sendMessage method
    @MessageMapping("/chat.sendMessage")

    // to define which topic or queue we want to send this message.
    // So every time we receive a message or payload, it will be queued to the queue called "/topic/public"
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(
            @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        // in case a new user joins, this will allow us to establish connection between the user and the websocket.
        // add username in websocket session.

        //headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        Objects.requireNonNull(headerAccessor.getSessionAttributes())
                .put("username", chatMessage.getSender());

        return chatMessage;
    }
}
