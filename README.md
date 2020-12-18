[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]


<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/aeternalism/issuance">
    <img src="https://avatars0.githubusercontent.com/u/75020642" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">AEternalism Issuance</h3>

  <p align="center">
    Issuance smart contract for crowdfunding, token sale
    <br />
    <a href="https://aeternalism.com">View Demo</a>
    ·
    <a href="https://github.com/aeternalism/issuance/issues">Report Bug</a>
    ·
    <a href="https://github.com/aeternalism/issuance/issues">Request Feature</a>
  </p>
</p>


<!-- ABOUT THE PROJECT -->
## About The Project

This project is built for AEternalism token sale event, but it will suite your need because I try to code as abstract as possible.


<!-- USAGE EXAMPLES -->
## Usage

This Issuance smart contract use State Machine pattern to validate and handle all actions at current stage.

There are 3 stages: SETUP, OPEN, and CLOSE.

1. SETUP
- Initial stage is SETUP
- Contract owner must call setup event to initialize Event that he wants to host.
- Event contains many useful fields such as: name (primary key), token price (ETH/token), min/max deposit...

2. OPEN
- After setup, owner call openEvent with its name to start the Event
- During OPEN stage, investor can deposit ETH into this smart contract
- Deposit stopped when total ETH raised > event Goal or current timestamp > event end time


3. CLOSE
- At Close stage, investor will call withdraw to receive Issuance token with formular

  ```
  Received token = Sum(ETH x Issuance price)
  ```


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/aeternalism/issuance/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Le Brian - [Email](mailto:lebrian@aeternalism.com)

Project Link: [https://github.com/aeternalism/issuance](https://github.com/aeternalism/issuance)


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/aeternalism/issuance.svg?style=for-the-badge
[contributors-url]: https://github.com/aeternalism/issuance/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/aeternalism/issuance.svg?style=for-the-badge
[forks-url]: https://github.com/aeternalism/issuance/network/members
[stars-shield]: https://img.shields.io/github/stars/aeternalism/issuance.svg?style=for-the-badge
[stars-url]: https://github.com/aeternalism/issuance/stargazers
[issues-shield]: https://img.shields.io/github/issues/aeternalism/issuance.svg?style=for-the-badge
[issues-url]: https://github.com/aeternalism/issuance/issues
[license-shield]: https://img.shields.io/github/license/aeternalism/issuance.svg?style=for-the-badge
[license-url]: https://github.com/aeternalism/issuance/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
