> **Warning**
> This project is currently a work in progress and is not yet ready for use

# UEye

UEye is a command-line interface (CLI) tool that uses machine learning to generate component-based React code from an image of a website. It uses a pre-trained TensorFlow model to identify the different elements of the website and generates React components that can be used to recreate the website in code.

UEye takes as input an image file of a website and a component map that maps the different elements of the website to React components. It outputs a React component hierarchy that can be used to render the website in code.

This repo also contains `classifier`, which is a tool for identifying the different elements of a website in an image. It allows you to input a folder of images and output resized images with annotation data for creating/training a model using the cli.

## Installation

To install UEye, you can use the following command to create a binary for your operating system:

```bash
yarn pkg:macos
```

## Usage

To use UEye, you need to provide it with an image file of a website and a component map. The component map should be a JavaScript or TypeScript file that exports a mapping of website elements to React components.

Here is an example of how to use UEye:

```bash
ueye path/to/image.jpg path/to/component-map.ts
```
