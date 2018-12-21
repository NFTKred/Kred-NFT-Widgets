
# Coin.Kred-Widgets
A Javascript widget to handle rendering of Coin.Kred Widgets
## Installation
Include bundle.js file in your HTML document:
```html
<link href="dist/bundle.js" rel="stylesheet">
```
## Basic Usage
Add the following to your code:
```html
<div id="app_coinkred"></div>

<script type="text/javascript" src="/dist/bundle.js"></script>
<script>
	CoinKredWidget();
</script>
```
## Options
Use the following options to customize your widget:
| Option     | Default Value | Description |
| ---------- | ------------- | ----------- |
| target     | `app_coinkred`| ID to render widget |
| widget     | `explore`     | Widget to render. Valid values are `explore`, `marketplace`, `collection`, `newsfeed` or `leaderboard` |
| domain     | `null`        | Render Coins from a certain collection domain. Eg. 'jdr.ceo' |
| sort       | `-likes`      | Sort the Coins. Valid values are `-likes`, `+likes`, `-created`, `+created`, `-circulation`, `+circulation` |
| tags       | `null`        | Render Coins that contain these tags. Comma seperated list. Eg. 'empire.kred,rewards' |
| showCollectionStats | `true` | Show collection stats |
| showSearchBar | `true`     | Show search bar |
| showSortToggle | `true`    | Show sorting |

## Examples
To show the Coins collection for a domain:
```javascript
CoinKredWidget({
  widget: 'collection',
  domain: 'jdr.ceo'
});
```

To show all Coins tagged 'animals':
```javascript
CoinKredWidget({
  widget: 'explore',
  tags: 'animals'
});
```
