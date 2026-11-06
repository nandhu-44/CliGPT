# CliGPT

[![npm](https://img.shields.io/npm/v/cligpt?style=flat-square&logo=npm)](https://www.npmjs.com/package/cligpt)
![status](https://img.shields.io/badge/status-archived-lightgrey?style=flat-square)
![built](https://img.shields.io/badge/built-Feb%202023-blue?style=flat-square)

> **Archived.** CliGPT is no longer maintained and does not work with the current OpenAI API.
> It stays here as a record of one of my first published tools.

CliGPT let you ask OpenAI's models questions from your terminal: one global install, one API key, one command.

```bash
cligpt -a "What are the top 5 programming languages?"
```

## The story

ChatGPT launched at the end of November 2022, a few months after I started college. I wanted it in the
terminal where I spent most of my time. There was no official CLI and no ChatGPT API yet, so I built my own
on top of the GPT-3 completions API, using free API credits from OpenAI.

I published the first version to npm on **20 February 2023**, about a week before OpenAI released the ChatGPT API.
Over the next four weeks I shipped more than 20 releases, adding an interactive prompt mode, a self-update
command, key validation, readable error messages and a loading spinner. It ended with **25 releases on npm** and
people still install it today.

Since then the space has moved far ahead. Tools like OpenAI's Codex CLI and Anthropic's Claude Code do
everything CliGPT did and much more. I no longer have the API credits either, so rather than keep a broken tool
alive, I'm archiving it here.

## What it did

| Command | What happens |
|---|---|
| `cligpt -k <api-key>` | Saves your OpenAI API key (also reads `OPENAI_API_KEY`) |
| `cligpt -a "<prompt>"` | Sends the prompt and prints the model's answer |
| `cligpt -a` | Interactive mode: asks for your prompt, then answers |
| `cligpt --update` | Updates itself through npm and keeps your saved key |
| `cligpt -v` | Shows the installed version |

Before sending a prompt it checked the key with a cheap API call, and it turned OpenAI errors into plain messages:
invalid key (401), quota exceeded (402) or service unavailable (503).

## Built with

Node.js · [`openai`](https://www.npmjs.com/package/openai) v3 SDK · `commander` · `chalk` · `update-notifier` ·
GitHub Actions for publishing to npm

## Why it no longer works

- It uses the v3 `openai` SDK and the legacy **completions** endpoint. OpenAI has since retired the GPT-3 completion
  models and moved chat models to a different API.
- The last update (v0.11.3, April 2024) switched the model to `gpt-3.5-turbo`, which is a chat model and isn't
  accepted by the completions endpoint.

## What I'd do differently today

Looking back as a more experienced developer:

- **Store the key safely.** CliGPT wrote the key in plain text to `apiKey.json` inside the global npm install folder.
  Today I'd use the OS keychain, or at least a file under the user's config directory with restricted permissions.
- **Use the chat API with streaming**, so answers appear as they're generated instead of all at once.
- **Keep conversation history**, so follow-up questions have context.
- **Support other providers.** Letting it talk to local models (for example through Ollama) or any
  OpenAI-compatible endpoint would make it usable without a paid key.
- **Check for updates less often.** It checked npm every minute; once a day is plenty.

## License

ISC
