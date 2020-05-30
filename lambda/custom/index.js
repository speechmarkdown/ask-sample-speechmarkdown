/*
* Copyright (C) 2020 Speech Markdown - All Rights Reserved
* You may use, distribute and modify this code under the
* terms and conditions defined in file 'LICENSE.txt', which
* is part of this source code package.
*
* For additional information please
* visit : http://speechmarkdown.org
*/

const Alexa = require('ask-sdk-core');
// Speech Markdown library for response interceptor
const smd = require('speechmarkdown-js');
// i18n library for localization interceptor
const i18n = require('i18next');
// i18n strings for different locales. Only 'en' shown
const languageStrings = require('./languageStrings');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = handlerInput.t('WELCOME_MSG');
    const repromptText = handlerInput.t('WELCOME_REPROMPT');

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};

const MyNameIsIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'MyNameIsIntent';
  },
  handle(handlerInput) {

    const nameSlot = handlerInput.requestEnvelope.request.intent.slots.name.value;
    const speechText = handlerInput.t('NAME_MSG');

    return handlerInput.responseBuilder
      .speak(speechText, { nameSlot: nameSlot })
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = handlerInput.t('HELLO_MSG');
    const repromptText = handlerInput.t('HELLO_REPROMPT');

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = handlerInput.t('HELP_MSG');

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = handlerInput.t('GOODBYE_MSG');

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speechText = handlerInput.t('FALLBACK_MSG');

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = handlerInput.t('REFLECTOR_MSG', { intentName: intentName });

    return handlerInput.responseBuilder
      .speak(speakOutput)
      //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    const speechText = handlerInput.t('ERROR_MSG');

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const LocalizationRequestInterceptor = {
  process(handlerInput) {
    i18n.init({
      lng: Alexa.getLocale(handlerInput.requestEnvelope),
      resources: languageStrings
    }).then((t) => {
      handlerInput.t = (...args) => t(...args);
    });
  }
};

const SpeechMarkdownResponseInterceptor = {
  process(handlerInput, response) {
    if (response) {

      const speechMarkdown = new smd.SpeechMarkdown({ platform: 'amazon-alexa' });

      if (response.outputSpeech && response.outputSpeech.ssml) {
        let speakOutput = response.outputSpeech.ssml;
        speakOutput = speakOutput.replace('<speak>', '').replace('</speak>', '');
        response.outputSpeech.ssml = speechMarkdown.toSSML(speakOutput);
      }

      if (response.reprompt &&
        response.reprompt.outputSpeech &&
        response.reprompt.outputSpeech.ssml) {

        let repromptOutput = response.reprompt.outputSpeech.ssml;
        repromptOutput = repromptOutput.replace('<speak>', '').replace('</speak>', '');
        response.reprompt.outputSpeech.ssml = speechMarkdown.toSSML(repromptOutput);
      }
    }
  }
};


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    MyNameIsIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(
    LocalizationRequestInterceptor)
  .addResponseInterceptors(
    SpeechMarkdownResponseInterceptor)
  .lambda();
