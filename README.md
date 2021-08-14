<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/39160563/129457020-61e30df4-7253-4ff6-a010-0613ddb23c34.png">
</p>

# speedcontrol-tweetr
Control Twitter right from your NodeCG dashboard!

[![Release](https://img.shields.io/github/v/release/nicnacnic/speedcontrol-tweetr?label=Release)](https://github.com/nicnacnic/speedcontrol-tweetr/releases)
![License](https://img.shields.io/github/license/nicnacnic/speedcontrol-tweetr?label=License)
[![Twitter](https://img.shields.io/twitter/follow/nicnacnic11?style=social)](https://twitter.com/nicnacnic11)
[![Discord](https://img.shields.io/badge/-Join%20the%20Discord!-brightgreen?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/A34Qpfe)

## About
*This is a bundle for [NodeCG](https://github.com/nodecg/nodecg); if you do not understand what that is, we advise you read their website first for more information.*

speedcontrol-tweetr is a bundle for NodeCG to allow users to schedule and post tweets without actually logging into the website. This bundle is meant for speedrunning marathons, therefore it includes all the features one might need to pull off an online marathon. Gone are the days where you need to use Tweetdeck or manually schedule tweets for your marathon!

### Features
- Post and schedule tweets based on the active speedcontrol run
- Include embedded images and videos in your tweets

## Requirements
- [NodeCG](https://github.com/nodecg/nodecg)
- [NodeCG Speedcontrol](https://github.com/speedcontrol/nodecg-speedcontrol)

## Installation
To install, navigate to your root NodeCG directory and run the following command.

```nodecg install nicnacnic/speedcontrol-tweetr```

After the installation completes, create a config file by running `nodecg defaultconfig speedcontrol-tweetr`.

You will need to create a Twitter Developer account and get an API key/secret and an access token/secret to connect to Twitter. That process is outside the scope of this guide.

## Usage
Once the bundle is configured properly, usage is pretty simple. On first load, the bundle should automatically retrieve all runs and load them into the bundle. To edit tweets, simply select your game in the dropdown and press `Edit`. There is a 280 character limit. Make sure to save!

For media, upload images and videos through NodeCG's asset tab, located in the top-right. To select the media you want to use for your tweet, open the dropdown and select your file. Supported formats are png, jpg, gif and mp4. Images can not be larger than 5 MB, GIF's 15 MB, and videos 512 MB. Make sure your filename does **not** have spaces or invalid characters, and your media is within the size limit, or it could cause your NodeCG instance to crash.

Every time the active run is changed, the Tweet button will countdown, then send the tweet. You can either press the button to send the tweet immediatly or press the cancel button to abort. The text box at the bottom will preview what is about to be sent.

## Other Bundles
- [nodecg-marathon-control](https://github.com/nicnacnic/nodecg-marathon-control) The sucsessor to speedcontrol-layouts and obs-control, this bundle can manage all aspects of your marathon including streams, layouts, and text!
- [speedcontrol-layouts](https://github.com/nicnacnic/speedcontrol-layouts) A pack of simple yet easily customizable layouts, works very well with this bundle!
- [obs-control](https://github.com/nicnacnic/obs-control) A NodeCG bundle to control an instance of OBS.

## Contributing
If you find any bugs or simply have a suggestion, please create an issue in the [issue tracker](https://github.com/nicnacnic/obs-control/issues).

If you're having issues or just want to chat, I can be reached on my [Discord](https://discord.gg/A34Qpfe) server.

## License
MIT  License

Copyright (c) 2021 nicnacnic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
