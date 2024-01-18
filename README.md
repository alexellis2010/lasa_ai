# Xander: My personal assistant

This project is for [LASA](https://lasa.austinschools.org/) in which I describe myself using an AI that talks about me and pokes at me.

TODO: insert video here

## Usage

```sh
$ npm i
$ export OPENAI_API_KEY=...
$ node index.js
(Ctrl+C to quit)
```

## About

This LASA project is about an AI I created that knows about me from [a question and answer document](https://github.com/alexellis2010/lasa_ai/blob/main/qa.json) I filled out about me. His name is Xander. He starts with a greeting we made him say because with no prompting it sometimes generates whole conversations instead of just a greeting. He talks to me via another AI known as [`tts-1` using the `onyx` voice](https://platform.openai.com/docs/api-reference/audio/createSpeech) that turns his text into speech. I would then respond and another AI known as [`whisper-1`](https://platform.openai.com/docs/api-reference/audio/createTranscription) turns my speech into text.

The [`index.js`](https://github.com/alexellis2010/lasa_ai/blob/main/index.js) file has the high-level logic of the project and utilizes other files to handle the details. Those include the [`stt.js`](https://github.com/alexellis2010/lasa_ai/blob/main/stt.js), [`tts.js`](https://github.com/alexellis2010/lasa_ai/blob/main/tts.js), [`db.js`](https://github.com/alexellis2010/lasa_ai/blob/main/db.js), and [`llm.js`](https://github.com/alexellis2010/lasa_ai/blob/main/llm.js) files. "STT" stands for [speech to text](https://en.wikipedia.org/wiki/Speech_recognition). It converts my voice into text the LLM ([Large Language Model](https://en.wikipedia.org/wiki/Large_language_model)) can understand. TTS is similar. It stands for [text to speech](https://en.wikipedia.org/wiki/Speech_synthesis). It converts my AI's (Xander's) text into speech using another AI that converts text to speech called `tts-1` using the `onyx` voice. [`db.js`](https://github.com/alexellis2010/lasa_ai/blob/main/db.js) uses the vectors in [`qavector.json`](https://github.com/alexellis2010/lasa_ai/blob/main/qavector.json) to pop up three questions like the question you have asked. [`llm.js`](https://github.com/alexellis2010/lasa_ai/blob/main/llm.js) configures the llm and makes it easier to use said llm. In this case, it is [`gpt-3.5-turbo` in ChatGPT mode](https://platform.openai.com/docs/api-reference/chat/create) (GPT stands for [Generative Pre-trained Transformer](https://en.wikipedia.org/wiki/Generative_pre-trained_transformer)).

If you want to change the questions and answers Xander is aware of, you have to first modify the [`qa.json`](https://github.com/alexellis2010/lasa_ai/blob/main/qa.json) file to have your own questions and anwsers. Then re-run `node vector.js > qavector.json`. This recreates the vector file. Next, delete the `index` directory that was created by Vectra using the old vector file. Preferably, the amount of questions you have is greater than or equal to the amount already present.
