---
slug: blog/wails-v2-released
title: Wails v2 Released
authors: [leaanthony]
tags: [wails, v2]
date: 2022-09-22
---

![montage screenshot](../../../assets/blog-images/montage.png)

# It's here!

Today marks the release of [Wails](https://wails.io) v2. It's been about 18
months since the first v2 alpha and about a year from the first beta release.
I'm truly grateful to everyone involved in the evolution of the project.

Part of the reason it took that long was due to wanting to get to some
definition of completeness before officially calling it v2. The truth is,
there's never a perfect time to tag a release - there's always outstanding
issues or "just one more" feature to squeeze in. What tagging an imperfect major
release does do, however, is to provide a bit of stability for users of the
project, as well as a bit of a reset for the developers.

This release is more than I'd ever expected it to be. I hope it gives you as
much pleasure as it has given us to develop it.

# What _is_ Wails?

If you are unfamiliar with Wails, it is a project that enables Go programmers to
provide rich frontends for their Go programs using familiar web technologies.
It's a lightweight, Go alternative to Electron. Much more information can be
found on the [official site](https://wails.io/docs/introduction).

# What's new?

The v2 release is a huge leap forward for the project, addressing many of the
pain points of v1. If you have not read any of the blog posts on the Beta
releases for [macOS](/blog/wails-v2-beta-for-mac),
[Windows](/blog/wails-v2-beta-for-windows) or
[Linux](/blog/wails-v2-beta-for-linux), then I encourage you to do so as it
covers all the major changes in more detail. In summary:

- Webview2 component for Windows that supports modern web standards and
  debugging capabilities.
- [Dark / Light theme](https://wails.io/docs/reference/options#theme) +
  [custom theming](https://wails.io/docs/reference/options#customtheme) on Windows.
- Windows now has no CGO requirements.
- Out-of-the-box support for Svelte, Vue, React, Preact, Lit & Vanilla project
  templates.
- [Vite](https://vitejs.dev/) integration providing a hot-reload development
  environment for your application.
- Native application
  [menus](https://wails.io/docs/guides/application-development#application-menu) and
  [dialogs](https://wails.io/docs/reference/runtime/dialog).
- Native window translucency effects for
  [Windows](https://wails.io/docs/reference/options#windowistranslucent) and
  [macOS](https://wails.io/docs/reference/options#windowistranslucent-1). Support for Mica &
  Acrylic backdrops.
- Easily generate an [NSIS installer](https://wails.io/docs/guides/windows-installer) for
  Windows deployments.
- A rich [runtime library](https://wails.io/docs/reference/runtime/intro) providing utility
  methods for window manipulation, eventing, dialogs, menus and logging.
- Support for [obfuscating](https://wails.io/docs/guides/obfuscated) your application using
  [garble](https://github.com/burrowers/garble).
- Support for compressing your application using [UPX](https://upx.github.io/).
- Automatic TypeScript generation of Go structs. More info
  [here](https://wails.io/docs/howdoesitwork#calling-bound-go-methods).
- No extra libraries or DLLs are required to be shipped with your application.
  For any platform.
- No requirement to bundle frontend assets. Just develop your application like
  any other web application.

# Credit & Thanks

Getting to v2 has been a huge effort. There have been ~2.2K commits by 89
contributors between the initial alpha and the release today, and many, many
more that have provided translations, testing, feedback and help on the
discussion forums as well as the issue tracker. I'm so unbelievably grateful to
each one of you. I'd also like to give an extra special thank you to all the
project sponsors who have provided guidance, advice and feedback. Everything you
do is hugely appreciated.

There are a few people I'd like to give special mention to:

Firstly, a **huge** thank you to [@stffabi](https://github.com/stffabi) who has
provided so many contributions which we all benefit from, as well as providing a
lot of support on many issues. He has provided some key features such as the
external dev server support which transformed our dev mode offering by allowing
us to hook into [Vite](https://vitejs.dev/)'s superpowers. It's fair to say that
Wails v2 would be a far less exciting release without his
[incredible contributions](https://github.com/wailsapp/wails/commits?author=stffabi&since=2020-01-04).
Thank you so much @stffabi!

I'd also like to give a huge shout-out to
[@misitebao](https://github.com/misitebao) who has tirelessly been maintaining
the website, as well as providing Chinese translations, managing Crowdin and
helping new translators get up to speed. This is a hugely important task, and
I'm extremely grateful for all the time and effort put into this! You rock!

Last, but not least, a huge thank you to Mat Ryer who has provided advice and
support during the development of v2. Writing xBar together using an early Alpha
of v2 was helpful in shaping the direction of v2, as well as give me an
understanding of some design flaws in the early releases. I'm happy to announce
that as of today, we will start to port xBar to Wails v2, and it will become the
flagship application for the project. Cheers Mat!

# Lessons Learnt

There are a number of lessons learnt in getting to v2 that will shape
development moving forward.

## Smaller, Quicker, Focused Releases

In the course of developing v2, there were many features and bug fixes that were
developed on an ad-hoc basis. This led to longer release cycles and were harder
to debug. Moving forward, we are going to create releases more often that will
include a reduced number of features. A release will involve updates to
documentation as well as thorough testing. Hopefully, these smaller, quicker,
focussed releases will lead to fewer regressions and better quality
documentation.

## Encourage Engagement

When starting this project, I wanted to immediately help everyone who had a
problem. Issues were "personal" and I wanted them resolved as quickly as
possible. This is unsustainable and ultimately works against the longevity of
the project. Moving forward, I will be giving more space for people to get
involved in answering questions and triaging issues. It would be good to get
some tooling to help with this so if you have any suggestions, please join in
the discussion [here](https://github.com/wailsapp/wails/discussions/1855).

## Learning to say No

The more people that engage with an Open Source project, the more requests there
will be for additional features that may or may not be useful to the majority of
people. These features will take an initial amount of time to develop and debug,
and incur an ongoing maintenance cost from that point on. I myself am the most
guilty of this, often wanting to "boil the sea" rather than provide the minimum
viable feature. Moving forward, we will need to say "No" a bit more to adding
core features and focus our energies on a way to empower developers to provide
that functionality themselves. We are looking seriously into plugins for this
scenario. This will allow anyone to extend the project as they see fit, as well
as providing an easy way to contribute towards the project.

# Looking to the Future

There are so many core features we are looking at to add to Wails in the next
major development cycle already. The
[roadmap](https://github.com/wailsapp/wails/discussions/1484) is full of
interesting ideas, and I'm keen to start work on them. One of the big asks has
been for multiple window support. It's a tricky one and to do it right, and we
may need to look at providing an alternative API, as the current one was not
designed with this in mind. Based on some preliminary ideas and feedback, I
think you'll like where we're looking to go with it.

I'm personally very excited at the prospect of getting Wails apps running on
mobile. We already have a demo project showing that it is possible to run a
Wails app on Android, so I'm really keen to explore where we can go with this!

A final point I'd like to raise is that of feature parity. It has long been a
core principle that we wouldn't add anything to the project without there being
full cross-platform support for it. Whilst this has proven to be (mainly)
achievable so far, it has really held the project back in releasing new
features. Moving forward, we will be adopting a slightly different approach: any
new feature that cannot be immediately released for all platforms will be
released under an experimental configuration or API. This allows early adopters
on certain platforms to try the feature and provide feedback that will feed into
the final design of the feature. This, of course, means that there are no
guarantees of API stability until it is fully supported by all the platforms it
can be supported on, but at least it will unblock development.

# Final Words

I'm really proud of what we've been able to achieve with the V2 release. It's
amazing to see what people have already been able to build using the beta
releases so far. Quality applications like [Varly](https://varly.app/),
[Surge](https://getsurge.io/) and [October](https://october.utf9k.net/). I
encourage you to check them out.

This release was achieved through the hard work of many contributors. Whilst it
is free to download and use, it has not come about through zero cost. Make no
mistakes, this project has come at considerable cost. It has not only been my
time and the time of each and every contributor, but also the cost of absence
from friends and families of each of those people too. That's why I'm extremely
grateful for every second that has been dedicated to making this project happen.
The more contributors we have, the more this effort can be spread out and the
more we can achieve together. I'd like to encourage you all to pick one thing
that you can contribute, whether it is confirming someone's bug, suggesting a
fix, making a documentation change or helping out someone who needs it. All of
these small things have such a huge impact! It would be so awesome if you too
were part of the story in getting to v3.

Enjoy!

&dash; Lea

PS: If you or your company find Wails useful, please consider
[sponsoring the project](https://github.com/sponsors/leaanthony). Thanks!
