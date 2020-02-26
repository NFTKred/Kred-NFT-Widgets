
# Kred NFT Widgets
A Javascript widget to handle selection, sorting, and rendering of a page of NFTs. Try the [Kred NFT Widget builder](https://nftkred.github.io/Kred-NFT-Widgets/).

## Installation
Include krednftwidget.css and krednftwidget.js file in your HTML document:
```html
<link href="https://app.nft.kred/krednftwidget.css" rel="stylesheet">

<script type="text/javascript" src="https://app.nft.kred/krednftwidget.js"></script>
```
## Basic Usage
Add the following into <head>:
```html
<link href="https://app.nft.kred/krednftwidget.css" rel="stylesheet">
```

Add the following into <body>:
```html
<div id="app"></div>

<script type="text/javascript" src="https://app.nft.kred/krednftwidget.js"></script>
<script>
	NFTKredWidget();
</script>
```
## Options
Use the following options to customize your widget:

| Option     | Default Value | Description |
| ---------- | :------------- | :----------- |
| target     | `app`| ID to render widget |
| widget     | `explore`     | Widget to render. Valid values are `explore`, `marketplace`, `mywallet`, `newsfeed`, `leaderboard`, or `minter` |
| domain     | `null`        | Render NFTs from a certain collection domain. Eg. 'jdr.ceo' |
| sort       | `-likes`      | Sort the NFTs. Valid values are `-likes`, `+likes`, `-created`, `+created`, `-circulation`, `+circulation` |
| tags       | `null`        | Render NFTs that contain these tags. Comma seperated list. Eg. 'empire.kred,rewards' |
| showMyWalletBundles | `true` | Show subscribed bundles in your wallet |
| showSearchBar | `false`     | Show search bar |
| showSortToggle | `false`    | Show sorting |

## Examples
To show the NFTs collection for a domain:
```javascript
NFTKredWidget({
  widget: 'mywallet',
  domain: 'jdr.ceo'
});
```

To show all NFTs tagged 'animals':
```javascript
NFTKredWidget({
  widget: 'explore',
  tags: 'animals'
});
```
