---
title: TI-JS
---

<script
  src="https://cdn.jsdelivr.net/npm/ti-js@{{ site.version }}/dist/web/ti.min.js"
  crossorigin="anonymous"></script>
<script
  src="https://code.jquery.com/jquery-3.4.1.min.js"
  integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
  crossorigin="anonymous"></script>
<script src="{{ '/assets/js/demo.js' | relative_url }}"></script>

<noscript>
  <style>
    .noscript {
      display: none;
    }
    pre {
      white-space: initial;
    }
  </style>
</noscript>

## What is this?

If you're familiar with the [TI-84 graphing calculator](https://en.wikipedia.org/wiki/TI-84_Plus_series),
you might know that you can program it with code that looks like this:
- Input
<textarea
  id="source"
  rows="2" cols="20"
  spellcheck="false"
  data-persist="false">2->X
Disp X+3</textarea>

Well, this project aims to implement that language in JavaScript
so that it can run in the browser.
Try changing the input above to see this output change:

- Output
<textarea id="output" class="noscript" readonly rows="2" cols="20"></textarea>
<noscript markdown="1">
```txt
ERR: Looks like JavaScript is disabled. As this is a JS library, the demo won't work!
```
</noscript>

## But why?

I wrote a lot of programs in TI-Basic a long time ago,
and I'd like to be able to preserve and look back on them.
You can see my collection at
[ti84-entertainment](https://github.com/davidtorosyan/ti84-entertainment);
I hope to show all of those off here some day.

## And it works?

Kinda. Check out the [tests](tests) to see what's supported,
or experiment in the [playground](playground).

## Can I use this?

Sure, check out the [README](https://github.com/davidtorosyan/ti-js) on GitHub
for instructions.
Note that it's still in prerelease and isn't even versioned yet.
Also maybe reach out and tell me why you want to!

## What's next?

I've got some of TI-Basic implemented, but there's more to be done.
As certain milestones are hit I'll update this page.

## Anything else?

See the rest of my projects at [davidtorosyan.com](https://davidtorosyan.com)
