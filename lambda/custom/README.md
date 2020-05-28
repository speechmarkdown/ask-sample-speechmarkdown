# Getting Started

Sample of how to use Speech Markdown https://speechmarkdown.org with Alexa Skills Kit (ASK) SDK.

All Text-to-Speech (TTS) strings are found in the `languageStrings.js` file.

Normally, each string could be plain text or Speech Synthesis Markup Language (SSML).
With this sample, we use the simplified Speech Markdown instead of SSML.

The `SpeechMarkdownResponseInterceptor` transforms the Speech Markdown to SSML just before the response is returned.

