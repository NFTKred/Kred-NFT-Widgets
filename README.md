
# Kred NFT Widgets
A Javascript widget to handle selection, sorting, and rendering of a page of NFTs. Try the [Kred NFT Widget builder](https://nftkred.github.io/Kred-NFT-Widgets/).

## Installation
Include krednftwidget.css and krednftwidget.js file in your HTML document:
```html
<link href="https://cdn.nft.kred/assets/nft/krednftwidget.css" rel="stylesheet">

<script type="text/javascript" src="https://cdn.nft.kred/assets/nft/krednftwidget.js"></script>
```
## Basic Usage
Add the following into <head>:
```html
<link href="https://cdn.nft.kred/assets/nft/krednftwidget.css" rel="stylesheet">
```

Add the following into <body>:
```html
<div id="app"></div>

<script type="text/javascript" src="https://cdn.nft.kred/assets/nft/krednftwidget.js"></script>
<script>
	KredNFTWidget();
</script>
```
## Options
Use the following options to customize your widget:

| Option     | Default Value | Description |
| ---------- | :------------- | :----------- |
| target     | `app`| ID to render widget |
| widget     | `explore`     | Widget to render. Valid values are <br/>`explore` - Displays all NFTs that were minted <br/>`marketplace`- Displays all marketplace NFTs<br/>`mywallet` - Displays all NFTs in a wallet<br/>`newsfeed`- Displays newsfeed<br/>`leaderboard` - Displays circulation leaderboard<br/>`signup` - Displays sign up / log in panel<br/>`minter` - Displays NFT minter |
| domain     | `null`        | Render NFTs from a certain collection domain. Eg. 'jdr.ceo' |
| sort       | `-likes`      | Sort the NFTs. Valid values are `-likes`, `+likes`, `-created`, `+created`, `-circulation`, `+circulation` |
| tags       | `null`        | Render NFTs that contain these tags. Comma seperated list. Eg. 'empire.kred,rewards' |
| showMyWalletBundles | `true` | Show subscribed bundles in your wallet |
| showSearchBar | `false`     | Show search bar |
| showSortToggle | `false`    | Show sorting |
| nftTypes | `''` | For `minter`: NFT types to show. Comma seperated list of NFT types. Eg. 'coin,card,ticket,badge,custom,attestation,chip,membershipcard,coupon,book,domain'  |
| nftColor | `''` | For `minter`: HEX Value. Default NFT color when minting. |
| nftTextColor | `''` | For `minter`: HEX Value. Default NFT text color when minting |
| nftBgColor | `''` | For `minter`: HEX Value. Default NFT background color when minting |
| nftBackImage | `''` | For `minter`: Image URL. Default back image for NFTs, this skips the back background uploading step |

## Examples
To display the NFTs in a wallet for a domain:
```javascript
KredNFTWidget({
  widget: 'mywallet',
  domain: 'jdr.ceo'
});
```

To display all NFTs tagged 'animals':
```javascript
KredNFTWidget({
  widget: 'explore',
  tags: 'animals'
});
```

To display minter with default styles:
```javascript
KredNFTWidget({
  widget: 'minter',
  nftTypes: 'coin,card',
  nftColor: '#ffffff'.
  nftTextColor: '#666666',
  nftBgColor: '#f1f1f1',
  nftBackImage: 'http://cdn.nft.kred/assets/nft/img/wallet-kred.png'
});
```
