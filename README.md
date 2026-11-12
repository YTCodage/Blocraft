# BLOCRAFT — un Minecraft jouable dans le navigateur

Un seul fichier : **`blocraft.html`**. Aucune installation, aucun serveur, aucune
compilation. Double-clique dessus (Chrome, Edge ou Firefox récent) et ça joue.

> Pour jouer **à deux, chacun sur son écran**, les deux joueurs ouvrent le même
> fichier sur leur propre ordinateur — voir « Jouer à distance » plus bas.

---

## 1. Lancer le jeu

1. Ouvre <https://ytcodage.github.io/Blocraft/jeu/>. Pour héberger une copie locale,
   conserve `blocraft.html` **et** son dossier `assets/`.
2. Au premier lancement, choisis ton profil **Joueur** ou **Admin**. Le code
   Admin est demandé sur un écran séparé, avec sa propre progression.
3. Clique **Créer une partie**. Un assistant affiche **une seule question à la fois** :
   - **1/4 — Monde** : normal, plat ou mono-bloc ;
   - **2/4 — Mode** : Survie, Hardcore, Créatif ou Trolle ;
   - **3/4 — Nom** : le nom de ta partie, entre 3 et 28 caractères ;
   - **4/4 — Graine** : facultative, laisse vide pour un terrain aléatoire.
4. La barre indique ta progression. **Retour** conserve tes réponses ; **Annuler**
   abandonne la création sans changer ta partie actuelle. Le monde plat propose
   Créatif ou Trolle, pas Survie.
5. **Créer ma partie** confirme tes choix, lance l’introduction puis la génération.
   Rien n’est créé lors du simple passage d’une question à l’autre.

Les anciennes sélections simultanées du menu ont été remplacées par cet assistant.
Les cartes **Nether** et **L’End** restent accessibles par les portails en jeu (voir §3).

La partie est sauvegardée dans le navigateur : automatiquement (toutes les 2 minutes et à
chaque changement de mode), avec le bouton **Sauvegarder** de la pause, et en quittant.
Au menu, **▶ Reprendre une partie · N** affiche **toutes** tes parties (voir §1 bis).

## 1 bis. Tes parties sauvegardées

Le menu garde jusqu'à **12 parties** nommées dans le navigateur :

| Ce que tu vois | Ce que ça veut dire |
|---|---|
| **▶ Reprendre une partie · 2** | le nombre de parties enregistrées |
| Nom de la partie | celui que tu as donné au démarrage |
| Monde · Mode · date | le monde (normal, plat, mono-bloc…), le mode et l'heure de la dernière sauvegarde |
| **Jouer** | recharge la partie exactement où tu l'as laissée |
| **✕** (deux fois) | supprime la partie — la première fois, le bouton demande confirmation |

- **Une seule règle** : chaque partie a un nom. Deux parties peuvent avoir le même nom,
  la date les distingue ; le plus simple est de nommer « Survie », « Maison au bord du lac »…
- Le nom apparaît aussi dans la pause (`Monde normal · Survie`).
- Une partie **sans nom** (« ancienne partie ») venant d'une version précédente est reprise
  automatiquement : rien n'est perdu.

## 2. Commandes

| Touche | Action |
|---|---|
| `Z` `Q` `S` `D` (ou `W` `A` `S` `D`) | se déplacer |
| Souris | regarder autour (tour complet à 360° : rien ne bloque la caméra) |
| `Espace` | sauter / nager vers le haut / monter en vol |
| `Maj` | courir |
| **Clic gauche** | casser un bloc / attaquer |
| **Clic droit** | poser un bloc / manger / ouvrir un coffre / insérer un œil |
| `1`–`9`, molette | choisir l'objet de la barre |
| `E` | inventaire, établi, four, blocs |
| `F` | voler (créatif) |
| `M` | monter / descendre d’un wagonnet proche |
| `N` | couper / remettre la musique |
| `R` | retour au point de départ |
| `/vision` (dans le chat) | **Vision X** : afficher/masquer les portails et minerais ; `X` ne l'active plus |
| `F3` | infos techniques (FPS, position, graine) |
| `T` (ou `/`) | barre de commandes |
| `Échap` | pause (menu premium : réglages + **touches modifiables**) |

Sur mobile, des boutons tactiles apparaissent automatiquement — voir **§2 bis**.

> **Si le navigateur refuse de capturer la souris** (certains aperçus intégrés, iframes,
> navigateurs restrictifs), le jeu passe tout seul en **souris libre** : maintiens le
> **clic gauche et glisse** pour tourner la tête — sans limite d'angle, et si le curseur
> atteint un bord de l'écran la caméra continue de tourner. Un clic bref casse le bloc
> visé, un maintien sans bouger mine en continu.
>
> Le **clic droit est toujours capturé** par le jeu : aucun menu du navigateur ne
> s'ouvre, ni en jeu, ni dans un coffre, ni dans l'inventaire (les champs de texte
> gardent le clic droit normal, pour coller une commande).

### Sur téléphone (mode tactile)

BLOCRAFT est pensé pour être joué **au pouce, en paysage**, plein écran :

| Zone / bouton | Action |
|---|---|
| **Glisser à gauche** (moitié gauche de l'écran) | le joystick apparaît sous le doigt : marcher. Pousser à fond = **courir** |
| **Glisser à droite** | regarder autour de soi (360°, sans limite) |
| **SAUTER** | sauter — maintenir en vol fait monter |
| **Maintenir le doigt sur un bloc** | miner en continu après 350 ms ; un glissement annule le minage |
| **Toucher brièvement un bloc / personnage** | poser ou utiliser : coffre, établi, nourriture, commerce ; toucher une créature hostile pour frapper |
| **SAC** | inventaire, établi, four, blocs (glisser un objet : un tap pour prendre, un tap pour déposer) |
| **VOLER** (créatif) | active le vol ; deux flèches **▲ ▼** apparaissent pour monter et descendre |
| **⏸ en haut à droite** | menu de pause (réglages, sauvegarde, touches) |
| **Barre rapide** | un tap sur une case change d'objet |

* **Plein écran automatique** : dès « Jouer », le téléphone passe en plein écran et
  tente de verrouiller l'orientation en paysage. Un bouton **⛶ Plein écran (paysage)**
  est dans le menu pause si le navigateur a refusé.
* **Écran « Tourne ton téléphone »** si tu restes à la verticale (bouton *Jouer comme
  ça* pour continuer malgré tout).
* **Réglages mobiles** : la distance de rendu passe en *Basse* et la **résolution
  s'adapte toute seule** (elle baisse si le framerate chute, remonte quand ça respire) ;
  idéal sur un téléphone modeste.
* **Vibrations** courtes sur les boutons (coupables dans le menu pause), **sensibilité
  tactile** réglable, messages d'accueil la première fois.
* L'inventaire, l'établi, le four, les blocs et la pause s'ouvrent **en plein écran**,
  avec des cases carrées et des boutons à taille de doigt.

### Commercer avec un villageois

Vise un villageois puis **clic droit** (au doigt : **un toucher bref**) : le comptoir s'ouvre.
Chaque villageois a un **métier** tiré au hasard (fermier, forgeron, armurier,
bibliothécaire, boucher, prêtre, mineur), donc une liste de 4 échanges.
Une ligne = un échange : `8 × Blé → 1 × Émeraude`. Touche la ligne (ou **Échanger**),
c'est fait, avec le compteur de ce qu'il te reste et le nombre d'échanges restants.

| Métier | Il achète | Il vend |
|---|---|---|
| Fermier | blé | pain, pommes |
| Forgeron | fer, charbon | pioche en fer, plastron en fer |
| Armurier | diamants | casque en fer, épée et pioche en **diamant** |
| Bibliothécaire | livres | livres, bibliothèques, torches |
| Boucher | viande crue, os | viande cuite |
| Prêtre | lapis, redstone | **œil de l'End**, perle de l'End |
| Mineur | charbon, fer brut | torches, **diamants** |

> Pas assez d'ingrédients ? La ligne reste grisée et un message indique ce qu'il faut.
> Échap (ou la croix) referme le comptoir.

### Portes et lit de deux blocs : dormir pour passer la nuit

Deux nouveaux blocs de mobilier, avec leurs recettes :

| Bloc | Recette | Effet |
|---|---|---|
| 🚪 **Porte en bois** | 6 planches → 3 portes | se pose sur **deux blocs de haut**, s'ouvre et se ferme d'un **clic droit** (au doigt : **un toucher bref**) ; ouverte, on passe au travers |
| 🛏️ **Lit** | 3 laines blanches + 3 planches, sur un établi ouvert | occupe **deux cases de long**, orientées selon ton regard ; la nuit, un **clic droit** sur le lit te fait **dormir** : l'écran s'assombrit, la nuit passe, tu te réveilles à l'aube, et le lit devient ton **point de réapparition** |

> De jour, le lit refuse : *« On ne dort que la nuit »*. Et si un monstre rôde
> à moins de 12 blocs, impossible de fermer l'œil — il faut d'abord nettoyer.

Les moutons apparaissent le jour sur l’herbe et donnent **1 à 2 blocs de laine
blanche** lorsqu’ils sont tués. La recette « 4 fils → laine blanche » a été retirée.
En multijoueur, le sommeil passe par l’hôte pour avancer la nuit pour les deux
joueurs ; seul celui qui dort change son point de réapparition.

Casser une moitié de porte casse l'autre, et la porte retombe entière dans
l'inventaire. On pose les deux au sol, dos au mur, comme dans Minecraft.

### Frapper un villageois : les golems ripostent

Un villageois frappé **appelle à l'aide** : tous les golems de fer à moins de
30 blocs deviennent furieux et te prennent pour un monstre (7 dégâts par coup).
Ils abandonnent au bout d'une trentaine de secondes, ou si tu t'éloignes.
Frapper un golem directement le met aussi en colère.

### Choisir le mode de jeu

Choisis **Survie** ou **Créatif** au lancement d’une nouvelle partie. Le choix
est enregistré avec la sauvegarde. Le menu pause contient les réglages et la
sauvegarde, mais plus de bouton de changement de mode ni de Vision X.
Les commandes administrateur `/creatif` et `/survie` restent disponibles selon
les droits existants. La Vision X s'active uniquement avec `/vision` ou `/xray`
(droits Admin en multijoueur, désactivée en Hardcore). La touche `X` sert toujours
à descendre d'un véhicule.

### Les villages sont habités

Chaque village a **au moins quatre villageois** et **un golem de fer** qui le garde, et
**chaque maison contient un lit** (les maisons à étage en ont deux). Si tu arrives dans un
village vide, les habitants apparaissent en quelques secondes : le jeu vérifie les villages
autour de toi en permanence.

Frapper un villageois fait riposter **tous** les golems du coin (voir plus bas).

### Moins de trous dans la terre

Les grottes sont toujours là — grandes salles, galeries, ravines — mais elles **s'effacent
près de la surface** : les galeries s'affinent dans les huit derniers blocs, donc on trouve
des **entrées de grottes** (une par-ci, par-là, comme dans Minecraft) au lieu d'un sol
criblé de petits trous. Le Nether, lui, reste troué à souhait.

### Trouver du diamant

Le diamant se creuse **profondément** : descends sous la couche d'ardoise (sous ~y 28
en pratique, les filons les plus généreux sont entre **y 4 et y 26** — `F3` affiche la
hauteur). Les filons sont
plus nombreux qu'avant, et dans l'**ardoise profonde** les minerais prennent leur
variante sombre (minerai de diamant d'ardoise, de fer d'ardoise, etc.) — comme dans
Minecraft. Un bon repère : les grottes profondes et les lacs de lave.

### Fabriquer son premier établi

1. **`E`** → onglet **Établi** : sans établi, la grille est la **table de craft par
   défaut : 2 × 2, soit 4 cases**.
2. Casse un arbre, transforme la bûche en **4 planches**, puis place **4 planches en
   carré** dans ces 4 cases → **1 établi**.
3. **Pose l'établi au sol** (clic droit avec l'établi en main) : la grille passe à
   **3 × 3, soit 9 cases** (3 en largeur, 3 en longueur) et les recettes marquées
   **« Établi »** se débloquent. Éloigne-toi de plus de 4 blocs : on revient à 4 cases.

### Les sons

Chaque matière a son bruit, calculé en direct (aucun fichier à télécharger) :

| Ce que tu casses | Ce que tu entends |
|---|---|
| **pierre**, minerais, briques, béton | un « crac » grave et sec, avec un petit rebond |
| **bois**, planches, portes, établi, coffre | un craquement chaud, plus long, qui descend |
| **terre**, sable, gravier, neige | un « pouf » sourd, étouffé |
| **feuilles**, blé, cactus, citrouille | un froissement de végétal |
| **verre**, glace | un tintement cristallin qui traîne |
| **laine** | un bruit mat, tout doux |
| **métal**, bloc de fer, d'or, d'améthyste | une résonance métallique |

La **pose** d'un bloc s'accorde aussi à la matière, et une **TNT** qui explose fait
un vrai vacarme : souffle très grave, déflagration, claquement d'amorce, grondement
qui traîne et gravats qui retombent. Un outil qui casse a son propre bruit.

### La durée de vie des outils et des armures (les blocs, jamais)

Comme dans Minecraft, un outil s'use **d'un clic par bloc cassé ou par coup porté**.
Une **petite barre de couleur** apparaît sous l'icône, dans la barre rapide et dans le
sac : verte, orange puis rouge. À zéro l'outil **casse** et disparaît.

| Outil | Clics avant la casse |
|---|---|
| Bois | 59 |
| Pierre | 131 |
| Fer | 250 |
| Diamant | 1561 |
| Netherite | 2031 |

Les **armures** s'usent aussi, mais seulement quand tu **encaisse un coup** qui est
absorbé (casque 165 à 407 clics selon la matière, plastron, jambières, bottes : chacune
sa valeur). La durée de vie est **sauvegardée avec la partie** : un pic cassé reste cassé.
**Les blocs n'ont pas de durée de vie** et ne s'usent jamais.

### Ce qui tombe par terre

Casser un bloc **à moins de 5 blocs** de soi : le butin va **directement dans le sac**.
Casser **plus loin** : l'objet **tombe par terre**, apparaît en **petit cube 3D qui
tourne sur lui-même**, puis **revient vers toi** dès que tu t'approches (moins de
5 blocs) ou se ramasse en passant dessus. Les blocs sans intérêt (herbe, pierre taillée)
ne tombent pas.

En **créatif**, rien de tout ça : on casse d'un clic et rien ne tombe.

### Créatif : des blocs infinis

En créatif, l'onglet **Blocs** de l'inventaire donne **tous** les blocs et objets.
Un clic sur un bloc le met **dans la case tenue, en quantité infinie** (le compteur
affiche **∞**) : il ne s'épuise jamais. Choisis un **autre** bloc : il **remplace
automatiquement** celui de la case tenue — pas besoin de vider quoi que ce soit ni de
changer d'emplacement.

### L'œil de l'End indique la forteresse

L'**Œil de l'End** (1 perle d'Enderman + 1 émeraude) se **lance au clic droit** : au
lieu de partir droit devant, il **file vers la forteresse souterraine** (qui abrite maintenant une ruine du Nether), en laissant une traînée violette. Il retombe en te disant la
**distance et la direction**, puis
**revient dans ton sac** : c'est un repère, il ne se consomme pas. Sur un cadre, il s'y
pose comme avant (12 yeux = portail ouvert).

### La Vision X (commande `/vision`)

Tape **`/vision`** dans le chat pour l'activer ou la désactiver (`/vision on`,
`/vision off` ou `/xray` fonctionnent aussi). En multijoueur, cette commande est
réservée aux Admins ; elle est désactivée en Hardcore. La touche `X` ne l'active pas.
Une fois la commande saisie :

- la terre devient invisible : on voit **à travers le sol** ;
- restent visibles les **minerais**, l’**obsidienne des ruines du Nether**, les
  **cadres de l’End construits** (vides ou avec un œil), les portails ouverts,
  les lampes de mer et la glowstone ;
- un **repère flottant** signale chaque forteresse et sa ruine du Nether — **réparée ou non** —
  avec sa **distance**, et une **flèche** indique ceux qui sont derrière toi ;
- un bandeau en haut donne la ruine la plus proche et le nombre de forteresses repérées
  dans la carte (jusqu'à 28).

Tape `/vision off` ou `/vision` à nouveau pour revenir au monde normal.

### Changer ses touches

**Échap** ouvre le menu de pause : la colonne de droite liste toutes les commandes
(avancer, sauter, courir, voler, inventaire, commandes, infos, pause…). Clique sur
la touche, appuie sur la nouvelle, c'est enregistré pour de bon. **↺ Touches par
défaut** remet tout à zéro.

Deux détails qui évitent les mauvaises surprises :

- une touche ne peut servir qu'à **une** commande : l'affecter ailleurs la retire de l'ancienne ;
- les claviers **AZERTY et QWERTY** sont gérés ensemble (`Z`/`W` pour avancer, `Q`/`A` pour
  aller à gauche) : changer une touche garde l'équivalent de l'autre disposition ;
- taper le code secret du menu QA **ne change plus l'objet tenu** dans la barre rapide
  (les chiffres 2 0 2 6 ne sélectionnent plus les cases 2 et 6).

### Fabriquer un golem (avec une citrouille)

Comme dans Minecraft, on empile des blocs **puis on pose une citrouille sur la tête** :
le bloc du haut disparaît et le golem prend vie.

| Golem | Forme | Résultat |
|---|---|---|
| 🗿 **Golem de fer** | 2 **blocs de fer** empilés + **2 blocs de fer** en bras (à gauche et à droite du bloc du haut) + **citrouille** au sommet | 60 PV, 7 dégâts : il attaque les monstres autour de lui |
| ☃️ **Golem de neige** | 2 **blocs de neige** empilés + **citrouille** au sommet | 8 PV, lance des boules de neige ; la citrouille peut être sculptée ou lanterne |

La citrouille est consommée (comme les blocs de fer ou de neige). Ça marche en
survie comme en créatif, sur le monde normal, le monde plat et le mono-bloc.

### La perle de l'End

Trouvée sur les **endermen** et dans les coffres des forteresses, la perle se
**lance au clic droit** : elle vole, rebondit, et dès qu'elle touche un bloc tu es
**téléporté** à l'endroit où elle s'arrête. Comme dans Minecraft, la téléportation
coûte **5 points de vie** en survie (aucun coût en créatif). Pratique pour franchir
une crevasse, sortir d'une grotte ou sauter un mur. On peut avoir **deux perles en
vol en même temps** : chaque impact téléporte, même si la deuxième lancée touche
le sol avant la première.

### Armes de jeu, fusées d'artifice et cactus

À l’établi : **mitraillette** (4 fers, 2 cuivres, 1 bâton), **lance-roquettes**
(5 fers, 2 cuivres, 1 redstone), **12 balles** (1 fer, 1 poudre à canon) et
**2 roquettes** (1 fer, 2 poudres à canon, 1 redstone). Sélectionne l’arme et
clique gauche (maintenir pour la mitraillette) ou droit pour tirer. Les balles
frappent une cible ; la roquette explose et touche les créatures proches, sans
modifier les blocs. Les munitions sont consommées en survie.

À l'établi, une poudre à canon + un bâton + une ficelle fabriquent **3 fusées**.
Tiens une fusée puis utilise-la (clic droit ou **POSER** sur mobile) pour décoller :
**3,5 secondes de vol**, avec des étincelles ; espace / bouton Monter pour prendre
de l'altitude. Une nouvelle fusée prolonge le vol, jusqu'à 8 secondes. La fusée
est consommée, et à l'extinction la gravité revient. Les cactus piquent au
contact en survie (1 PV par coup, avec un délai entre deux coups).
Les textures du four (façade, grille, joints), de l'herbe (touffes et terre),
des blocs de diamant et d’or sont plus détaillées. Les lingots sont désormais
faciles à distinguer : cuivre orangé, fer gris métallique, or jaune et
netherite sombre.

### La portée de rendu

Menu **Échap** → *Distance de rendu* : **Basse**, **Normale**, **Élevée**, ou
**Infinie — pas de limite**. En mode infini, le brouillard disparaît, le terrain
se charge aussi loin que la machine le supporte (le rayon grandit tant que le
jeu tient son framerate, et se recale automatiquement s'il rame). Le réglage est
mémorisé d'une session à l'autre.

## 3. Les mondes (menu de départ)

Le menu propose trois mondes ; le mode **Survie** ou **Créatif** se choisit à
droite, juste avant **Jouer**. Le **Nether** et **l'End** n'y figurent plus : ce
sont des dimensions **à découvrir en jeu**, par un portail (voir §5) :

| Monde | Ce que c'est |
|---|---|
| 🌍 **Monde normal** | l'aventure complète : biomes, villages, grottes, donjons, forteresses, Nether et End par portail |
| 🌱 **Monde plat** | **infini et tout plat**, à perte de vue, **en créatif** : 152 blocs dans la palette (laines, bétons, minerais, décorations). Le monde à bâtir : tu vas aussi loin que tu veux, le sol ne change jamais (herbe, terre, pierre, roche-mère). |
| 🧊 **Mono-bloc** | **un seul bloc** qui repousse à chaque coup, le **vide** tout autour et **4 châteaux** à 100 blocs. Départ : 20 terres + 1 pousse d'arbre. **Tomber = mourir.** |

> Le **Nether** s'ouvre avec un **portail en obsidienne allumé au briquet** ; **l'End**
> en **construisant toi-même un anneau de 12 cadres et 12 yeux** : il n’y a plus de portail naturel de l’End.

> Les deux cartes verrouillées restent visibles dans le menu pour indiquer le but :
> elles s'ouvrent en jeu, jamais au départ. Une **forteresse est toujours générée
> près du point de départ** (à quelques dizaines de blocs), mais sa salle contient
> une ruine du Nether. L’End reste accessible grâce aux cadres que tu fabriques.

> Le mono-bloc est un monde à part : pour y revenir, choisis-le à nouveau dans le
> menu. En créatif, tomber dans le vide te ramène sur le bloc (pas de mort).

## 4. Jouer à deux avec le nom de la partie

Après avoir choisi un mode, donne un **nom de 3 à 28 caractères** à ta partie.
Ce nom reste modifiable dans la pause avec **Renommer la partie**.

**L’hôte :** menu → **Jouer à deux**, ou pause → **Inviter un ami**. Vérifie le
nom et clique **Créer une partie**. Envoie ce nom à ton ami et garde la page ouverte.

**L’ami :** **Jouer à deux → Se connecter**. La barre de recherche accepte le
**nom exact de la partie**, puis **Rejoindre la partie** établit la connexion.
Majuscules/minuscules et espaces répétés sont normalisés ; les accents comptent.
Un nom déjà occupé par une partie ouverte est refusé. Un nom composé exactement
de six chiffres est réservé aux anciens codes de secours : utilise un autre nom.

Le renommage d’une partie publiée réserve d’abord le nouveau nom, sans couper
la connexion existante. En cas de nom occupé, l’ancien reste utilisable. Un **code
à six chiffres de secours** reste affiché pour compatibilité.

Il ne s’agit **pas d’un annuaire mondial ni d’une recherche partielle** : il faut
connaître le nom exact. Une partie solo n’est publiée que lorsque l’hôte choisit
**Créer une partie**. Deux joueurs maximum, hôte connecté ; pas de serveur permanent.
Les noms sont des invitations faciles à deviner, pas des mots de passe.

La mise en relation utilise **PeerJS Cloud** et la bibliothèque locale PeerJS 1.5.5
(`assets/vendor/`, licence MIT). Les données du jeu circulent directement en WebRTC.
Internet et un réseau compatible sont nécessaires ; aucun relais TURN propre au
projet n’est déployé. Les noms et codes cessent de fonctionner quand la session
est fermée. Les sauvegardes restent locales. Rejoindre crée une fiche locale
séparée, sans écraser la partie solo précédente du joueur invité.

## 5. La survie, comme dans Minecraft

**Tu démarres les mains vides.** Aucun kit, aucune pioche : c'est à toi de tout faire.

```
arbre (mains nues) → planches → bâtons → pioche en bois
     → pierre → pioche en pierre → four → fer → pioche en fer
     → diamant → pioche en diamant → obsidienne → portail du Nether
```

* **Minerais en filons** : charbon, cuivre, fer, or, lapis, redstone, diamant et
  émeraude apparaissent **au hasard, par petits filons**, dans les bonnes couches de
  profondeur (fer jusqu'à y ≈ 62, or et redstone vers y 5-30, diamant sous y 16).
  En creusant de la **pierre** ou de l'**ardoise profonde**, tu tombes en plus
  régulièrement sur un minerai. Il y en a aussi dans les coffres (villages, donjons,
  épaves, mineshafts).
* **Paliers de pioche** : charbon = bois ; fer/cuivre/lapis = pierre ; or/diamant/
  redstone = fer ; obsidienne/netherite = diamant. Avec une pioche trop faible, le
  bloc met 4,5× plus de temps et ne donne **rien** (un message te dit quelle pioche
  il faut).
* **Faim, vie, armures, respawn** : tout est géré ; la nuit, les monstres sortent.

### Les chutes

Aucun dégât **jusqu'à 5 blocs** de chute (inclus). Au-delà, chaque bloc coûte
**2 points de vie** (une chute de 10 blocs retire 10 PV). L'eau et le vol
annulent la chute.

### Le soleil tue les morts-vivants

Zombies et squelettes **brûlent au soleil** (−2,6 PV/s), fuient et n'attaquent plus
tant qu'ils flambent. Ils ne survivent qu'à l'ombre (sous un arbre, un surplomb, dans
une grotte) ou **dans l'eau**. La nuit, ils sortent normalement.

### Le portail du Nether

À l’entrée dans le Nether ou dans l’End, un panneau affiche le nom de la dimension.

Obsidienne en **4 × 5** (coins inutiles) + **briquet** dans le portail → voyage.
L'obsidienne se mine à la pioche en diamant… ou se fabrique (eau + lave).
Le monde normal génère **5 portails du Nether en ruine**, plus un dans la forteresse :
**deux obsidiennes manquent à chaque cadre**. Répare-les puis utilise le briquet
pour les allumer. Les portails construits par les joueurs ne sont pas limités.

### Le portail de l'End

1. Fabrique **12 cadres de l'End** (2 pierres taillées + 1 obsidienne).
2. Pose-les en **anneau 5 × 5 sans les coins**, debout, comme dans Minecraft.
3. Trouve des **yeux de l'End** : 1 **perle de l'End** (lâchée par les **endermen**,
   qui rôdent la nuit) + 1 émeraude.
4. Clic droit sur chaque cadre pour y insérer un œil. Quand les 12 cadres ont leur
   œil, le centre se remplit d'un portail : traverse pour affronter le **dragon de
   l'End**.

## 6. Codes de triche et commandes

En jeu, appuie sur **`T`** (ou **`/`**), tape la commande, puis **Entrée**.
Tape **`aide`** pour afficher le rappel des commandes dans le tchat.

> Les codes ne sont **pas** listés dans le menu Échap : il n'y a plus de panneau
> « codes » dans l'interface normale.

| Commande | Effet |
|---|---|
| `kit` | équipement complet (outils, armure, torches, nourriture) |
| `diamants` | 64 diamants + pioche en diamant |
| `xp 500` | expérience |
| `soigner` / `nourriture` | vie et faim au max / de quoi manger |
| `dieu` | invincibilité (on/off) |
| `vol` | voler (passe en créatif) |
| `jour` / `nuit` | changer l'heure |
| `tp 100 80 100` | se téléporter (ou `tp <pseudo>` pour rejoindre l'autre joueur) |
| `spawn zombie 5` | faire apparaître des monstres |
| `lumiere` | poser des blocs lumineux autour de soi |
| `graine` | afficher la graine du monde |
| `structures` | liste des structures + leurs chances et leurs coffres (`structures village` pour le détail) |
| `tpstruct village` | se téléporter à la structure la plus proche de ce nom |
| `vitesse 2` | courir 2× plus vite (0,25 à 20) |
| `portee 12` | porter son bras à 12 blocs (2 à 64) |
| `remplir` / `vider` | inventaire complet / inventaire vide |
| `aide` | rappel des commandes |

## 6 bis. Inventaire, établi et four

**`E`** ouvre l'inventaire façon Minecraft : 27 cases + barre rapide + 4 emplacements
d’armure à gauche, un aperçu du personnage équipé et une grille personnelle 2 × 2.
Les interfaces reprennent les panneaux gris, cases biseautées et textes pixelisés des captures de référence.
La police Pixelify Sans est fournie localement sous licence OFL dans `assets/fonts/`.

| Onglet | Ce qu'on y fait |
|---|---|
| **Sac** | ranger, échanger, équiper une armure (clic sur un casque, etc.) |
| **Établi** | la **vraie grille de craft 3 × 3** (en haut, au centre) + le guide des recettes |
| **Four** | cuire : fer brut → lingot, sable → verre, viande → viande cuite, bûche → charbon… |
| **Blocs** | palette complète en créatif |

* Un **clic droit main vide** sur un **établi** ouvre l'artisanat, sur un **four**
  ouvre le four. Place un ingrédient dans la case du haut, du combustible en bas,
  puis récupère le résultat à droite. Une cuisson dure 3 secondes : un charbon
  permet 8 cuissons, un bloc de charbon 80 ; une planche, une bûche ou deux bâtons
  permettent une cuisson. La flamme et la flèche indiquent l’avancement.
* Chaque four possède son contenu, conservé à la fermeture et dans les sauvegardes.
  Casser un four chargé fait tomber son contenu. Les zones non chargées ne sont
  pas prises pour des fours détruits ; leur cuisson est suspendue.
* Le petit **livre vert** ouvre et ferme le catalogue : recherche, ingrédients,
  schéma de fabrication et bouton **Remplir** ; dans le four, **Charger** prépare
  l’ingrédient et le combustible depuis le sac.

### Fabriquer des planches en un clic

Dans le livre de recettes, le bouton **Planches** transforme **tout le bois du sac**
en planches (1 bûche → 4 planches), sans rien placer à la main. La recette manuelle
**9 bûches (une par case) → planches** existe aussi.

### La table de craft 3 × 3

Onglet **Établi** : une grille **3 × 3 au centre, tout en haut**, une flèche, et la
case du résultat à droite. **C'est toi qui fabriques**, case par case :

* **clic gauche** sur une case de ton sac = tu prends la pile (ou tu la poses),
  **clic droit** = la moitié ; un clic pose **1 objet** dans la case de la grille.
* les recettes ont maintenant leur **vraie forme Minecraft** : pioches en diagonale,
  haches décalées, épées à la verticale, casques et plastrons en creux… La case du
  résultat s'allume dès que la forme est bonne.
* Choisir une recette dans le livre **empile automatiquement plusieurs fournées**
  dans chaque case (jusqu'à 64 par pile), si les ingrédients sont disponibles.
  Deux bûches donnent ainsi 8 planches ; quatre planches donnent 8 bâtons.
* **clic sur le résultat** = 1 fournée fabriquée ; **clic droit** ou **Tout fabriquer**
  = jusqu'à épuisement des piles de la grille.
* fermer l'inventaire (Échap) **rend tout** ce qui traîne dans la grille ; le bouton
  **Vider la grille** le fait sans fermer l'inventaire.

**Deux tailles de grille, comme dans Minecraft :**

| Situation | Grille | Ce qu'on peut faire |
|---|---|---|
| Inventaire personnel | **2 × 2 — 4 cases** | recettes de base : planches, bâtons, **établi** ; aucun outil, aucune arme ou armure |
| **Établi posé et ouvert directement** | **3 × 3 — 9 cases** | recettes avancées : blocs, outils, armes et armures |

L'établi **se fabrique à la main** (4 planches en carré dans les 4 cases), puis on le
**pose** au sol. Le badge en haut à droite indique en permanence l'état :
**Sans établi · 4 cases (2 × 2)** ou **Établi ouvert · 9 cases (3 × 3)**. Être simplement à côté ne suffit plus à agrandir la grille personnelle.

Le **guide** liste les recettes par catégorie (Outils / Combat / Blocs / Nourriture /
Divers) avec un **aperçu de la forme** en 3 × 3 et un bouton **Remplir** qui place les
ingrédients tout seul ; il ne te reste qu'à cliquer le résultat. Les ingrédients
manquants apparaissent en **rouge**.
* Les ingrédients manquants apparaissent en **rouge** dans la recette.

## 6 ter. Eau, lave et seau

* L'**eau ne se casse pas** : inutile d'insister, la pioche ne la raye pas.
  Pour la déplacer, il faut un **seau** (3 lingots de fer, recette d'outils).
* **Seau vide + clic droit sur une source d'eau** → seau d'eau. Sur de la **lave**
  → seau de lave. Un seau plein se **vide** d'un clic droit sur le sol. L'eau que
  tu as versée forme une source récupérable avec le seau vide ; tu peux la viser
  depuis la rive, même à travers ses écoulements. Un écoulement seul ne se ramasse pas.
* L'eau **coule** (7 niveaux) : elle tombe, s'étale, et durcit la lave en
  **obsidienne** au contact. La lave des lacs du Nether est incassable : on la
  contourne, ou on la ramasse au seau.
* Textures retravaillées : caustiques et écume pour l'eau, croûte fracturée et
  rivières incandescentes pour la lave.

## 6 quater. Le butin suit la difficulté

Chaque structure a un **niveau de difficulté de 1 à 5** : plus c'est dangereux,
plus le coffre contient de ressources utiles. Les objets précieux restent rares,
avec des plafonds même dans les structures difficiles.

| Niveau | Structures | Ce qu'on trouve en plus |
|---|---|---|
| 1 | village, igloo | pain, blé, charbon, quelques émeraudes |
| 2 | avant-poste, épave, bibliothèque, portail du Nether, grotte | lingots de fer, livres, obsidienne |
| 3 | mine, donjon, cabane de sorcière, temple, forge, trésor enterré | or, diamants, pioche et plastron en fer |
| 4 | monument, manoir, forteresse du Nether, stronghold | rares diamants, épée en diamant occasionnelle, perles |
| 5 | bastion, cité de l'End | **netherite très occasionnelle**, plastron en diamant rare, un peu d’or |

## 7. Mode administrateur

Au premier lancement, choisis **Joueur** (fonctionnement habituel) ou **Admin**.
Le profil Admin demande maintenant **uniquement un pseudo** (2 à 24 caractères),
mémorisé avec le profil dans le navigateur. Aucun PIN, code de salon ou invitation
à saisir. **Profil** permet de changer de profil/pseudo. **Monde Admin** ouvre un
écran réduit à « Rejoindre le monde Admin » et « Retour », puis trois types :
**normal**, **tout plat**, **monobloc**.

Ces trois mondes sont communs aux Admins : Firebase arbitre un hôte par type et
conserve son checkpoint ; les navigateurs jouent ensemble par WebRTC. L'accès
par simple pseudo est un choix de facilité, **pas une authentification Admin sûre**.
Les personnes modifiant leur client peuvent également choisir ce profil.
Voir [l'activation Firebase](firebase/SETUP.md) pour la configuration nécessaire,
les règles, la persistance, les limites et les coûts.

| Commande | Qui | Effet |
|---|---|---|
| `proprietaire` | Profil Admin | commande de compatibilité ; ne change pas le profil |
| `pseudo Alex` | tout le monde | changer son nom (affiché au-dessus de l'avatar en ligne) |
| `admin Alex` | Admin hôte | nommer le joueur connecté Admin et mémoriser son profil sur son navigateur |
| `retirer Alex` | Admin hôte | retirer ses droits dans cette partie (son profil local Admin reste mémorisé) |
| `admins` | tous | liste des admins |
| `creatif` / `survie` | solo ou Admin en ligne | changer son mode, hors Hardcore |
| `donner diamant 32` | admin | recevoir un objet (recherche par nom, insensible aux accents) |
| `tuer` | admin | foudroyer les monstres à moins de 28 blocs |
| `explosion` | admin | trou de creeper sur le bloc visé |
| `nettoyer` | admin | vider les créatures autour de soi |
| `dim nether` | admin | changer de dimension |
| `expulser` | hôte/admin | éjecter l'invité du monde |

Les admins sont mémorisés dans le navigateur du propriétaire et **envoyés
automatiquement à l'invité** à la connexion : un admin du monde peut donc faire
ses bêtises des deux côtés. Un bandeau **👑 ADMIN / 👑 PROPRIÉTAIRE** s'affiche en
haut à droite.

## 8. Ce qu'il y a dedans

* Monde **infini** (chunks générés à la volée), 4 mondes : monde normal, mono-bloc, Nether,
  End. Biomes, océans, montagnes enneigées, nuages.
* **Grottes variées** : tunnels tortueux, branches profondes, grandes salles stratifiées,
  ravines qui s'ouvrent en surface, cheminées verticales, poches de granit/diorite/
  andésite, ardoise profonde, lacs de lave au fond et plafonds lumineux.
* **Commerce** : 7 métiers de villageois, 4 offres chacun, comptoir tactile, échanges
  limités par marchandise.
* **162 blocs** (citrouilles, minerais du Nether, **portes et lit**…), 55 objets, **151 recettes** + 12 cuissons au four : bois, pierre, métaux,
  verre, **16 laines**, **16 bétons**, **8 minerais d'ardoise des abîmes**, améthyste,
  miel, mousse, boue, cuivre oxydé, quartz, TNT, redstone (pistes, lampes, blocs),
  coffres, fours, établi, portes de portail… Tout est dans l'onglet **Blocs** de
  l'inventaire créatif, et chaque bloc a une icône 3D fidèle.
* **Mono-bloc** : un bloc qui repousse à l'infini, le vide, **12 châteaux** et
  **30 donjons** flottants (tours au trésor, cryptes, ruines).
* **22 structures** façon Minecraft, dans les trois dimensions : villages, poste de
  pillards, tour de guet, pyramide du désert, temple de la jungle, hutte de sorcière,
  igloo, manoir, monument océanique, épave, trésor enterré, puits du désert, **5 portails
  naturels du Nether en ruine**, grotte, galerie de mine, donjon, **une forteresse
  avec une autre ruine du Nether**, cité ancienne, forteresse du Nether,
  bastion, cité de l'End. Les joueurs peuvent toujours construire leurs propres
  portails. Voir §8.
* **Créatures** : zombie, squelette (avec arc), araignée, creeper qui explose, vache,
  cochon, poule, villageois (commerce), golem de fer (qui défend le village et
  riposte si on frappe un villageois), enderman (téléportation),
  dragon de l'End (boss).
* **XP** : tuer un monstre, un villageois ou un golem rapporte de l'expérience ;
  barre verte et niveaux au-dessus de la barre rapide, avec bruitages.
* **Musique procédurale** : une ambiance calme qui devient vive et tendue quand un
  monstre approche ou que la vie descend (`M` pour couper).
* **Animations** : fêlures qui se dessinent sur le bloc pendant le minage, gerbe
  d'éclats quand il se casse, éclats qui rebondissent sur le sol, petites poussières
  à la pose d'un bloc, étincelles quand on frappe un monstre.
* **Effets** : pas feutrés, coups, sauts, portails, explosions,
  eau qui coule, lave, feuilles, ciel avec soleil/lune/étoiles.

## 9. Les structures (données « comme dans Minecraft »)

Chaque structure a sa **planche de terrain** (une cellule de 128 blocs en général), sa
**chance d'apparaître**, son **nombre de coffres** et son **nombre de bâtiments**.
Le jeu applique en plus une densité (≈ 4 chances sur 10 en surface) pour que le monde ne
soit pas saturé. Une épave sur deux, un donjon par-ci par-là : comme dans le vrai jeu.
Tape **`T`** puis **`structures`** pour revoir cette liste en jeu (et `structures village`
pour la fiche complète).

| Structure | Où | Chance | Coffres | Particularité |
|---|---|---|---|---|
| 🏘️ Village | surface | 62 % | 2 à 6 | 3 à 6 maisons + puits, église, bibliothèque, forge, ferme, boucherie, cloche, lampadaires ; maison en pierre des sables dans le désert |
| 🏹 Poste de pillards | surface | 22 % | 1 à 2 | tour de bois 3 étages, cage au sommet, tentes, chariot |
| 🗼 Tour de guet | montagnes | 30 % | 1 à 3 | pierre, 4 étages, escalier en spirale, créneaux, phare |
| 🏛️ Pyramide du désert | désert | 55 % | 4 | 5 degrés, salle du sommet, salle au trésor enterrée, piège de TNT |
| 🛕 Temple de la jungle | forêt | 35 % | 2 à 3 | pierre moussue, 3 niveaux, escaliers, salle secrète sous le sol |
| 🧙 Hutte de sorcière | marais, berges | 28 % | 1 | cabane sur pilotis, chaudron, cultures |
| ⛄ Igloo | neige | 30 % | 1 à 2 | dôme de neige + trappe vers une salle secrète enterrée |
| 🏰 Manoir | forêt sombre | 20 % | 3 à 6 | deux étages, bibliothèque, escalier central, toit-terrasse |
| 🔱 Monument océanique | océan | 32 % | 3 | prismarine, lanternes de mer, blocs d'or, éponges |
| ⛵ Épave | océan, plage | 55 % | 1 à 3 | coque brisée, mât, voile déchirée, cale au trésor |
| 🪙 Trésor enterré | plage | 40 % | 1 | un seul coffre, très riche, sous le sable |
| 🪣 Puits du désert | désert | 30 % | 0 | purement décoratif |
| 🌀 Portail du Nether | surface | 5 sites fixes par graine | 1 | cadre d'obsidienne allumé, netherrack, coffre |
| 🧱 Ruines | surface | 35 % | 0 à 1 | murs écroulés, colonnes, dallage à demi enseveli |
| 🕳️ Grotte | surface | 40 % | 1 à 2 | entonnoir, puits, salle éclairée, filons apparents |
| ⛏️ Galerie de mine | sous-sol | 60 % | 2 à 5 | couloirs étayés, embranchements, salle au trésor, puits d'aération |
| 💀 Donjon | sous-sol | 45 % | 2 | pierre moussue, générateur de monstres, couloir bouché |
| 🌌 Forteresse | sous-sol profond | 1 site fixe par graine | 2 à 4 | couloirs, bibliothèque, **portail du Nether en ruine (deux blocs manquants)** |
| 🏛️ Cité ancienne | ardoise profonde | 30 % | 2 à 4 | ardoise, basalte, champilumière, bâtiments en ruine |
| 🔥 Forteresse du Nether | Nether | 55 % | 1 à 3 | ponts de briques, piliers, pièces latérales, salle de lave |
| 🦴 Bastion | Nether | 35 % | 2 à 4 | basalte noir et pierre dorée, tours d'angle, blocs d'or |
| 🌆 Cité de l'End | End | 45 % | 1 à 3 | tours de purpur reliées par des ponts, cristaux au sommet |

Chaque coffre tire son butin dans une **table dédiée** (village, forgeron, temple, donjon,
mine, bibliothèque, forteresse, épave, trésor, manoir, monument, igloo, sorcière, portail,
grotte, Nether, bastion, cité de l'End) : les coffres de forgeron donnent fer, diamants et
obsidienne, ceux de l'End des éclats de netherite et des perles, ceux du désert de l'or et
de la TNT… Le **nombre de coffres est exactement celui de la fiche** : les coffres en trop
sont retirés à la construction.

## 10. Le mono-bloc en détail

* Le bloc du centre (0, 64, 0) repousse dès que tu le casses : d'abord de la terre,
  du bois et de la pierre, puis du charbon, du fer, des coffres, de l'or, du
  diamant, et enfin des blocs rares (netherite après ~200 coups).
* Tu démarres avec **20 terres** et **une pousse d'arbre** : pose la pousse, elle
  devient un arbre (feuilles = bois), puis fabrique ton établi et tes outils.
* **12 châteaux** flottants : 4 à 100 blocs (nord, est, sud, ouest), 4 en diagonale
  à ~141 blocs, 4 sur le grand anneau à 200 blocs. Murailles crénelées, 4 tours avec
  coffres, donjon central (5 coffres + établi + four), arbres, blé, torches.
* **30 donjons** flottants, répartis sur trois couronnes (62, 155 et 265 blocs), en
  trois modèles tirés au sort : **tour au trésor** (15 blocs de haut, 4 coffres,
  or et émeraude au sommet), **crypte** (piliers, sarcophage, 3 coffres) et
  **ruine effondrée** (tour brisée, campement, 2 coffres). Chaque donjon a au moins
  un coffre de niveau *donjon* ou *forteresse*.
* On les rejoint en empilant les blocs du mono-bloc, ou en volant en créatif
  (le repère des sites s'affiche dans le HUD).
* Le vide tue : dès que tu passes sous la couche 2, la chute est mortelle.

## 10 bis. Le Nether en grand

Le Nether est **immense** : la génération est infinie, bien au-delà de 50 000 ×
50 000 blocs, et le terrain est **criblé de grottes** (poches, longs tunnels qui se
croisent, grandes salles ouvertes) sur toute la hauteur.

* une **grande caverne d'arrivée irrégulière** (bord découpé, plafond qui monte et descend) ;
* un **lac de lave** encaissé, avec un **pont de nether brick** qui le traverse ;
* des **piliers de basalte** coiffés de glowstone, des plaques de sable des âmes ;
* **8 galeries** partent du hall vers l'extérieur, avec **salles latérales, bassins de
  lave et lumières** ; chaque galerie débouche sur une **grande caverne** : le Nether se
  parcourt, il ne s'arrête pas à la salle d'arrivée ;
* une **voûte haute** (entre 96 et 126 blocs) : de vraies cathédrales de roche, percées
  de cavernes « cathédrales » et éclairées de **glowstone et de champilueurs** accrochés
  aux plafonds (mesuré : ~500 glowstone et ~420 champilueurs par 16 chunks) ;
* **159 blocs** aux textures retravaillées : les minerais (charbon, fer, or, diamant,
  émeraude, lapis, redstone, cuivre) sont dessinés en **amas de cristaux** avec ombre
  portée et reflet, et les blocs de métal en **plaques biseautées** ;
* **5 minerais propres au Nether** (charbon, fer, or, diamant, émeraude) sur roche rouge ;
* **citrouilles** partout : sauvages dans les prairies, plus la **citrouille sculptée**
  (citrouille + silex) et la **lanterne-citrouille** qui éclaire comme une torche
  (sculptée + torche) ;
* des **filons partout** : charbon, fer, or, redstone, quartz, diamant, émeraude et
  **débris antiques (netherite)** tout au fond — les parois des cavernes en sont
  constellées (mesuré : ~31 % de vide, ~8 % de minerais dans la roche) ;
* des **forteresses du Nether** et des **bastions** générés dans le monde ;
* de nouvelles créatures : **Blazes** (jaunes, volants au combat) et **Piglins**
  (qui troquent de l'or) apparaissent dans les cavernes, en plus des monstres
  classiques ;
* le portail de retour est toujours à côté du point d'arrivée.

**Repères mesurés** (9 chunks au hasard) : 31,6 % de vide, et dans la roche
2,2 % de charbon, 1,5 % de quartz, 1,2 % de fer, 0,8 % d'or, 0,4 % de redstone,
0,2 % de diamant, 0,1 % d'émeraude et 0,1 % de débris antiques. Les parois des
grottes sont donc truffées de filons, comme dans le vrai Nether.

## 11. En cas de souci

| Problème | Solution |
|---|---|
| Monde noir / « WebGL2 n'est pas disponible » | navigue avec Chrome, Edge ou Firefox à jour, et active l'accélération matérielle |
| Le code d'invitation ne se connecte pas | réseau trop strict : passe par un VPN type Tailscale (voir §3) |
| La sauvegarde ne marche pas | évite la navigation privée (stockage bloqué) ; vérifie que tu as donné un nom à la partie |
| Une partie a disparu de la liste | la liste garde les 12 dernières parties : supprime les vieilles pour faire de la place |
| Le nom de la partie est faux | **Échap → Sauvegarder** enregistre sous le nom affiché en haut de la pause ; pour changer de nom, crée une nouvelle partie |
| Ça rame | menu Pause → **Distance de rendu : Basse** |
| Je veux voir le plus loin possible | menu Pause → **Distance de rendu : Infinie** |
| Impossible de regarder derrière soi | actualise la page (Ctrl+F5) : le jeu passe en mode souris libre, clic gauche maintenu + glisser |
| Un menu du navigateur s'ouvre au clic droit | actualise la page (Ctrl+F5) : le clic droit est désormais capturé partout dans le jeu |

L'écran de chargement affiche le logo **BLOCRAFT**, une barre de progression et une
astuce qui tourne ; comptez une quinzaine de secondes au premier lancement (le monde
se génère à la volée).

Bon jeu.


## Mort, rails et repérage des portails

- À la mort, le sac, la barre rapide, l’armure équipée et les objets de la grille
  de fabrication tombent à la position du joueur. Ils tournent sur eux-mêmes,
  sont récupérables en revenant à proximité et conservent leur usure.
  Comme les autres objets au sol, ils disparaissent après cinq minutes actives
  dans leur dimension (ou s’ils tombent dans le vide).
- **Rails** : 6 lingots de fer + 1 bâton → 16 rails.
- **Rails propulseurs** : 6 lingots d’or + 1 bâton + 1 redstone → 6 rails.
  Ils accélèrent automatiquement les wagonnets, sans alimentation supplémentaire.
- **Wagonnet en fer** : 5 lingots de fer. Poser sur un rail avec le clic droit ;
  **M** monte dans un wagon proche ou permet d’en descendre (clic droit aussi).
  Le rail propulseur orange et rouge accélère immédiatement un wagon posé dessus,
  puis continue à le pousser sans redstone. Les virages horizontaux sont possibles.
- Ces trois recettes utilisent l’établi. Les objets sont aussi disponibles dans
  l’inventaire créatif. Les wagonnets et objets au sol sont sauvegardés.
- **Vision X** : recherche des forteresses jusqu’à 8 000 blocs par axe et affiche
  des repères vers les ruines souterraines, leur distance et leurs coordonnées.
- Dans un nouveau monde, cinq ruines du Nether en surface et une forteresse avec
  une autre ruine sont réparties de façon déterministe. Chaque portail demande
  deux obsidiennes et un briquet. Aucun portail naturel de l’End n’est généré.

Test de logique ciblé : `node tests/death_rails_test.js`.

## Cinématiques de début et de victoire

Avant chaque nouvelle partie, une **cinématique narrative animée de 20 secondes**
montre le personnage arrivant par un ancien portail : il cherchait un refuge,
le passage se ferme, et il décide de rebâtir un foyer dans ce monde oublié. La reprise d’une sauvegarde ne relance pas l’introduction.

Après la défaite du dragon de l’End, une seconde cinématique de 20 secondes
raconte que le dragon était le dernier de son espèce : les tours le soignaient
et les endermen le protégeaient. Elle rend ensuite la main au joueur.
Cette histoire est une fiction propre à Blocraft, pas un récit officiel de Minecraft.
Le jeu est suspendu pendant la cinématique en solo. En multijoueur, l’autre
navigateur n’est pas mis en pause.

Ces animations Canvas et leurs textes sont intégrés au fichier HTML : pas de
fichier vidéo externe, de téléchargement ni de voix enregistrée. Le bouton
**Passer**, `Échap`, `Espace` ou `Entrée` permettent de reprendre immédiatement.
Le compteur s’arrête lorsque l’onglet est masqué ; les animations respectent
la préférence de réduction des mouvements du navigateur.

Test ciblé : `node tests/cinematics_test.js`.

## Site web et GitHub Pages

Le dépôt contient désormais un site statique complet :

- `index.html` : accueil responsive en français, univers visuel voxel et boutons Jouer.
- `assets/` : styles, favicon et illustration isométrique Canvas générée localement.
- `jeu/index.html` : page du jeu, retour à l’accueil et plein écran. Elle charge
  `../blocraft.html` dans une iframe de même origine, sans dupliquer le code du jeu.
- `.nojekyll` : publication statique directe sur GitHub Pages, sans compilation.

Les liens sont relatifs : le site fonctionne aussi bien à la racine d’un domaine
que sous le chemin de projet `/Blocraft/`. Sur GitHub Pages, les adresses sont :

- Accueil : <https://ytcodage.github.io/Blocraft/>
- Jeu : <https://ytcodage.github.io/Blocraft/jeu/>

Dans **Settings → Pages**, utiliser **Deploy from a branch**, chemin **/(root)**.
La branche configurée est automatiquement republiée à chaque push. Si le site est
publié depuis une branche de travail pour validation, sélectionner `main` après
la fusion de la pull request pour reprendre les publications depuis la branche
principale.

Pour tester en local :

```sh
npm ci
npm run serve
# Ouvrir http://localhost:8000/
```

Vérifications :

```sh
npm test
npx playwright install chromium
npm run test:site
```

Le test du site vérifie l’accueil et la page `/jeu/` aux largeurs 320, 390, 768
et 1440 pixels, les liens, les ressources et l’absence de débordement horizontal.
Il remplace le contenu de l’iframe pour isoler le test de mise en page de la
génération du monde ; ce n’est pas un test complet du moteur du jeu.
Les autorisations plein écran restent soumises aux limitations du navigateur,
notamment sur iOS. Les sauvegardes dépendent du navigateur et de l’origine :
une partie ouverte en `file://` n’est pas automatiquement transférée au site HTTPS.


## Tactile, matériaux, eau et discussion

- Les boutons **Miner** et **Poser** ont été supprimés. Un tap sur la scène fait
  une seule action ; maintenir sans bouger lance le minage. Un glissement ne pose
  jamais de bloc. Le bloc visé est calculé sous le doigt, pas seulement au centre.
  Le joystick à gauche et le regard à droite restent disponibles ; les gestes sont
  annulés à l’ouverture d’un menu, à la mort et à la perte de focus.
- Les **armes et armures nécessitent l’ouverture d’un établi posé** : elles sont
  verrouillées dans l’inventaire personnel, même si un établi est proche. Toucher
  l’établi (ou clic droit) l’ouvre, même en tenant un bloc. Un établi détruit ou
  devenu trop éloigné ne permet plus ces fabrications.
- **12 nouveaux blocs** : granit/diorite/andésite polis, marbre veiné, carrelages
  d’ardoise et de terre cuite, parquet de chêne, grès rouge, grès poli, verres bleu
  et vert, briques lumineuses. Ils ont leurs textures et recettes, et apparaissent
  dans le catalogue créatif. Les identifiants existants ne changent pas.
- La **bedrock (roche-mère)** est disponible en créatif et cassable uniquement
  dans ce mode ; elle reste indestructible à la main ou avec un outil en survie.
- Soleil et lune ont un disque **carré**. Les matériaux ont un éclairage directionnel
  plus doux ; les planches et l’établi ont des textures retravaillées.
- L’eau utilise désormais une surface raccordée entre les blocs de niveaux
  différents et des coordonnées de texture continues. Son shader lit la bonne
  texture d’eau (et non celle de neige), avec transparence, rides et reflets.
  Les contours et fissures ne sont plus dessinés sur l’eau ou sur un bloc déjà cassé.
- **Chat à gauche au milieu** : bouton **Chat** sur PC/mobile, ou `T` au clavier.
  Écris normalement pour discuter ; commence par `/` pour une commande.
  Les morts sont annoncées avec leur cause, par exemple « Joueur est mort,
  tué par un zombie ». Les messages sont échangés entre les deux joueurs déjà
  connectés en WebRTC ; en solo, ils restent locaux. Pas de salon public ni de serveur.
  L’historique conserve 40 entrées pendant la session ; textes limités à 240 caractères.

Tests supplémentaires : `npm run test:game` vérifie les vrais gestes tactiles
Chromium, les restrictions de fabrication, le chat et la compilation/rendu WebGL
sur une petite scène déterministe. Ce test ne remplace pas un essai sur un
appareil Android/iOS réel, ni une validation complète du multijoueur entre deux appareils.


## Fabrication et rareté des trésors

Les recettes de **blocs** se fabriquent désormais en ouvrant un établi posé,
comme les armes et armures. Deux exceptions permettent de démarrer : les **planches**
et l’**établi lui-même** restent fabricables dans le sac. Les autres objets simples
suivent leurs recettes existantes. Les blocs sans recette restent accessibles selon
les règles existantes (minage, exploration ou catalogue créatif).

Les coffres contiennent nettement moins de diamants, d’or, d’émeraudes, de fer et de
netherite. Les tirages précieux sont moins fréquents, les piles sont plus petites
et un plafond par coffre évite les grosses accumulations. Les bonus de forteresses
ne garantissent plus systématiquement des diamants et des lingots. Les ressources
dans le terrain et les récompenses du dragon ne sont pas modifiées par ce réglage.

Tests : `npm test`, `npm run test:game`, `npm run test:site`, `npm run test:rooms`.
Le dernier test utilise le vrai client PeerJS et un PeerServer de test local (la
dépendance de développement `peer`) avec deux navigateurs et un troisième refusé.
Il valide l’échange WebRTC, mais pas la disponibilité du cloud public ni tous les
cas de NAT sur Internet. Aucun serveur Node ne doit être déployé sur GitHub Pages.


### Vérification des nouveaux écrans

`npm run test:inventory` vérifie dans Chromium : les 27 + 9 cases, la grille
personnelle 2 × 2, l’équipement avec conservation de l’usure, le livre et sa
recherche, le remplissage et la fabrication, l’établi 3 × 3, le four avec sa
combustion et son résultat, sa sérialisation, la restitution du contenu d’un four
cassé et les écrans de largeur 320/390 pixels. Le catalogue créatif propose des
catégories, une recherche dans tous les objets et une barre d’accès à l’inventaire.
Le soleil et la lune utilisent maintenant des contours carrés nets et un motif
à pixels fixes, sans disque arrondi ni cratères lissés.


`npm run test:profile` vérifie le premier choix, le refus d’un mauvais code,
le profil Joueur, l’ancienne commande propriétaire, l’activation de
l’administration, la mémorisation et le changement de profil à 390 pixels.
Le test utilise un vérificateur de test, sans inclure le code réel dans le dépôt.


## Mode Trolle et interfaces simplifiées

**Trolle** conserve la construction du créatif, avec les attributs réels de la forme choisie. Après le choix du
mode et du nom, **Se transformer** permet de rechercher et choisir un animal,
un monstre courant ou un bloc. Les modèles sont animés et transmis à l’autre
joueur. Une vue à la troisième personne permet de voir son propre déguisement ;
le bouton de vue permet de revenir en première personne et l’apparence **Joueur**
permet de retrouver le personnage normal. Les transformations changent réellement les PV maximum, les dégâts, la vitesse,
la portée, la taille de collision et la hauteur des yeux. **G**, le bouton de capacité
mobile ou `/capacite` utilise le pouvoir. Exemples : téléportation d’Enderman,
explosion de Creeper/TNT avec mèche de 1,35 s et mort de la forme, escalade de
l’araignée au contact d’une paroi, chute ralentie de la poule, vol et résistance au
feu du Blaze, tirs à distance des squelettes/Blazes/golems de neige. Les morts-vivants
subissent le soleil ; l’Enderman subit l’eau. Les animaux peuvent récupérer des PV.
Les blocs sont immobiles, ont une taille et des PV dérivés de leur matière, n’ont
pas de faim et peuvent poser une copie (les lits restent longs de deux cases).
Il ne s’agit pas d’une simulation exhaustive de toutes les propriétés de chaque
bloc ou de chaque créature ; les boss ne sont pas proposés.
Le mode et l’apparence sont sauvegardés. `/troll` ou `/mode troll` active Trolle
en cours de partie, sauf en Hardcore. Une forme trop grande pour l’espace libre
est refusée sans remplacer la précédente.

Les barres de catégories « Combat », « Outils », etc. sont retirées des écrans.
Le catalogue affiche tous les objets et conserve la recherche. Le livre affiche
les recettes autorisées, avec recherche et remplissage. Les armes ne sont pas
supprimées du jeu : elles restent soumises aux règles d’établi.

Il n’existe plus d’onglet **Four** dans l’inventaire. Le four se fabrique avec
8 pierres taillées/cobblestone à l’établi, puis doit être posé et ouvert dans le
monde. La grille personnelle ne permet pas de fabriquer le four.

Les lits nouvellement posés utilisent deux cases sur un sol solide. Si une case
est occupée, aucune ressource n’est consommée. Casser l’une des moitiés retire
l’autre et ne rend qu’un lit. Les têtes internes ne sont pas des objets du catalogue.
Les anciens lits d’une seule case présents dans des sauvegardes restent compatibles
pour dormir ; casse-les et repose-les pour obtenir le nouveau format.

Les tests `test:game` couvrent le choix du mode, l’écran de nom, les apparences
locales/distantes, le rendu WebGL répété et les lits dans quatre orientations.
`test:rooms` utilise un vrai PeerServer local pour les noms Unicode, les collisions,
le renommage avec connexion conservée, le handshake Trolle et l’ancien code de secours.
La disponibilité du service public et les NAT de réseaux physiques ne sont pas
validés par ces tests locaux.


### Assistant de création : vérifications

`npm run test:wizard` vérifie l’unique question visible, les quatre valeurs de
progression, les retours sans perte, le nom obligatoire, la graine facultative,
la confirmation sans double lancement, l’annulation sans modification du monde
courant et les largeurs 320/390/1280 pixels. Les choix sont conservés dans un
brouillon jusqu’à la confirmation finale. Les titres reçoivent le focus à chaque
étape et la progression est exposée aux lecteurs d’écran. Les animations de la
barre respectent la préférence de réduction des mouvements.


## Chat et commandes centralisés

**T** ouvre le chat ; **/** ouvre directement le catalogue. La touche `/` est
reconnue aussi sur clavier AZERTY. Les commandes existantes et leurs alias sont
listés et filtrés à la frappe. ↑/↓ sélectionnent, **Tab** complète, **Entrée**
confirme. Les anciens raccourcis « Codes » du panneau QA conduisent au même chat.

- `/tp` demande **joueur**, **dimension** ou **coordonnées**. Le choix d’un joueur
  affiche les personnes réellement connectées ; un pseudo inconnu n’envoie jamais
  vers un autre joueur par défaut. `/tp Alex`, `/tp 20 80 -15`, `/tp end` fonctionnent
  aussi directement ; une destination bloquée dans la dimension courante est refusée.
- `/dim` propose Monde normal, Nether et End ; `/mode` propose les modes disponibles.
- `/donner` propose un objet puis une quantité ; `/spawn` une créature puis un nombre.
- `/xp`, `/vitesse`, `/portee` proposent des valeurs. Vitesse/portée fonctionnent sans
  devoir activer QA et sont temporaires, non sauvegardées.
- `/transforme` ouvre les formes ; `/capacite` utilise leur pouvoir ; `/vue` change la vue.
- `/joueurs`, `/position`, `/sauver`, `/inventaire`, `/recettes`, `/pause`, `/inviter`,
  `/renommer Nouveau nom`, `/dormir`, `/retour`, `/pointdepart`, `/hud` complètent les
  commandes existantes. Dormir exige toujours de regarder un vrai lit placé.
- `/admin` et `/retirer` proposent le joueur connecté ; la modification des droits
  passe par l’hôte. En ligne, les commandes de triche/voyage sont réservées aux
  admins autorisés par l’hôte. Trolle et ses pouvoirs restent accessibles hors Hardcore.

### Hardcore

L’assistant de création propose **Hardcore** dans les mondes normal et mono-bloc.
C’est une partie **solo**, en survie, avec des dégâts ×1,5, une seule vie et une
mort définitive mémorisée dans la sauvegarde. Recharger ou reprendre la partie ne
rend pas la vie ; le bouton Réapparaître reste désactivé. Les changements de mode,
les téléportations, le retour instantané R, QA, Vision X et les commandes de triche
sont désactivés ; les commandes d’information et d’interface restent disponibles.
`/hardcore` peut aussi engager la partie solo actuelle ; ce choix est irréversible
pour cette partie. Le stockage local demeure modifiable : aucun système de classement
ou de preuve anti-triche n’est annoncé.

### Monde Admin commun et QA temporaire

L'écran Admin n'a plus les options d'hébergement/invitation/copie de code. Après
**Rejoindre le monde Admin**, choisir **normal**, **tout plat** ou **monobloc**.
Un document canonique Firestore par type élit un navigateur hôte par transaction,
avec un bail de 45 secondes renouvelé toutes les 12 secondes. Les autres Admins
rejoignent automatiquement cet hôte. Le transport Admin accepte plusieurs membres
(test avec trois), sans changer la limite des parties ordinaires à deux.

Les checkpoints du monde hôte sont publiés atomiquement toutes les 30 secondes,
en segments et avec une limite de 8 Mio. Ils permettent de reprendre sur un autre
navigateur. Après une fermeture brutale, attendre l'expiration du bail et rejoindre
à nouveau ; il peut manquer les changements du dernier intervalle. Le navigateur
hôte doit rester ouvert/actif : Firestore n'est pas un serveur de jeu permanent.
Le choix Admin/Joueur, les sauvegardes ordinaires et QA restent locaux ; seuls les mondes Admin
et le pseudo technique associé à la session Firebase sont envoyés au cloud.

**Le profil et le pseudo persistent ; QA ne persiste jamais au rechargement.**
`/qa` l'active explicitement pendant la session. Le jeu conserve les droits hôte
pour les listes Admin ; le profil choisi par pseudo n'est pas une preuve d'identité.
La connexion Firebase anonyme et les règles ne créent pas de comptes du personnel.

**Activation requise dans le projet Firebase réel :** Authentication anonyme,
Firestore `(default)`, publication des règles fournies. Le SDK web ne donne pas
les droits de modifier ces réglages. Aucun test dans ce dépôt n'affirme avoir
validé leur activation en production. [Procédure complète](firebase/SETUP.md).
En cas de refus Firebase ou de réseau indisponible, un message explique le problème :
le jeu ne crée pas silencieusement un monde privé différent du monde commun.

### Personnage 3D dans l’inventaire

L’aperçu utilise des cuboïdes texturés projetés en 3D, une tête volumétrique avec
cheveux et nez, un éclairage par face, l’armure et une respiration animée. La tête
suit le pointeur ; glisser sur le personnage tourne le corps (souris ou tactile).
Les flèches gauche/droite fonctionnent aussi après avoir focalisé l’aperçu. La
préférence de réduction des mouvements supprime la respiration automatique.

Tests complémentaires : `npm run test:commands` (palette, choix guidés, capacités,
aperçu 3D, sauvegarde de la mort Hardcore, profil/QA) et `npm run test:adminrealm`
(vrai PeerJS/WebRTC local avec base cloud simulée : trois Admins,
3 types, relayage/ciblage, reprise persistante et erreurs Firebase sans fork local).

### Rails, véhicules et circuits

- **Utiliser / clic droit / tap** : poser un wagonnet sur un rail, puis l'utiliser
  pour monter. **X** ou le bouton **Descendre** permet de sortir. Le wagonnet peut
  aussi être utilisé avec un autre objet en main. Un siège occupé n'est pas écrasé.
- Marcher contre un mob ou un villageois le pousse ; un wagonnet vide proche le
  prend comme passager. Accroupissement + utilisation le fait descendre. Les boss
  ne montent pas. Les passagers et les véhicules sont sauvegardés.
- Les rails ordinaires prennent automatiquement un **angle** avec leurs voisins ;
  la géométrie visible et la trajectoire suivent la même courbe. Une boucle fermée
  tourne indéfiniment à faible vitesse (choix arcade, sans moteur obligatoire).
  Le rail propulseur accélère sous tension et freine sinon. Les tracés sont **plans**,
  pas des pentes ni des croisements à niveaux différents.
- Un aiguillage à trois branches sélectionne l'une des deux branches à partir
  du tronc ; un **levier adjacent** ou un signal de poussière change la sélection.
  À quatre voisins, la sélection alterne nord/sud et est/ouest. Les connexions
  restent des cases adjacentes : pas de téléportation entre rails éloignés.
- Circuits implémentés : leviers, boutons temporisés, plaques, poussière avec
  atténuation sur 15 cases, lampes, portes, TNT, répéteurs orientés et réglables,
  comparateurs comparaison/soustraction de signaux, torches inverseuses, pistons
  et pistons collants **horizontaux** (12 blocs maximum), détecteurs de wagonnet et
  rails activateurs qui éjectent les passagers. Utiliser un répéteur change son délai ;
  utiliser un comparateur change son mode. Les blocs directionnels suivent le regard
  lors de la pose. Les conteneurs et l'obsidienne ne sont pas poussables.
- Ce sont des circuits discrets à 10 Hz, **pas toutes les mécaniques de Minecraft** :
  pas de quasi-connectivité, de lecture analogique des coffres, de pistons verticaux,
  d'entonnoirs ou de distributeurs. Les recettes figurent dans le livre de l'établi.
- Poser le **bateau** sur l'eau, puis l'utiliser pour monter. Avancer/reculer avec les
  commandes habituelles et regarder pour tourner ; X / Descendre pour sortir.
- En réseau, l'hôte simule les circuits et les véhicules ; l'invité demande la pose,
  l'embarquement et la sortie, et transmet ses commandes de bateau. Un siège n'a
  qu'un conducteur. Ce protocole ne transforme pas le client en système anti-triche.

### Arc, TNT, coordonnées et météo

L'**arc** et les **flèches** se fabriquent à l'établi. Le gravier peut fournir du
silex, les poules des plumes. Tirer consomme une flèche hors créatif et use l'arc ;
le projectile a une gravité, heurte les blocs et inflige des dégâts aux mobs.
Une flèche arrêtée par un bloc peut être ramassée. En réseau, l'hôte applique les
impacts ; les projectiles de l'invité sont affichés sans second calcul des dégâts.

La **TNT exige un briquet pour l'allumage manuel** ; un circuit peut aussi l'amorcer.
Choisir des blocs en créatif réutilise une pile existante ou remplit la prochaine
case vide, sans écraser les choix précédents. Si l'inventaire est plein, un message
invite à libérer une case.

Le HUD affiche **X / Y / Z**, une rose des vents et un angle : nord 0°, est 90°,
sud 180°, ouest 270°. Les destinations de portails et les listes de lieux indiquent
également les trois axes. En vol, avancer suit la hauteur du regard ; lever/baisser
la tête fait monter/descendre. Les citrouilles naturelles sont beaucoup moins
fréquentes et les citrouilles sculptées ne sont plus générées naturellement.

La météo alterne entre ciel clair, pluie, neige et orage, avec particules extérieures,
assombrissement, éclairs et tonnerre. `/meteo clair|pluie|neige|orage` est aussi
accessible depuis le sélecteur `/`. Pas d'accumulation de neige au sol ni d'incendies
causés par la foudre. Le type de météo est sauvegardé et communiqué à l'invité.

### Victoire et outils QA

La mort du dragon met la cinématique de fin en attente même si QA, l'inventaire ou
la pause était ouvert. Après la scène, deux choix : rejoindre le **coffre de victoire**
ou rentrer dans le **monde normal**. `/victoire` rouvre ce choix après la victoire.
Le coffre contient notamment la **tête du dragon**, son **cœur**, des diamants,
de la netherite, une arme et des perles. Son contenu est sauvegardé : rouvrir le
coffre ou recharger ne réattribue pas la récompense. Le cœur permet aussi le retour.
Comme les coffres ordinaires, son inventaire reste local au client ; il n'existe
pas encore de gestion transactionnelle des inventaires partagés entre navigateurs.

Dans la liste **QA → entités**, chaque mob a maintenant **TP** et **Tuer**.
Les contrôles réseau restent soumis aux droits Admin de la partie.

`npm run test:mechanics` couvre les IDs de blocs 16 bits, la boucle et l'aiguillage,
la propulsion, le passager villageois sauvegardé, la redstone atténuée, le répéteur,
le piston collant, TNT/briquet, bateau, tir, sélection créative, vol au regard,
coordonnées, météo et victoire déclenchée depuis la pause. `test:rooms` vérifie aussi
le wagonnet invité et son siège exclusif, le décompte, la météo et le tir via un
vrai canal PeerJS/WebRTC local. `test:game` maillage/rendu WebGL inclut les nouveaux
blocs, rails courbes, wagonnets et bateaux.


### Développement Firebase

Le SDK est chargé à la demande et bundlé localement (pas de script CDN à l'exécution) :
`npm run build:cloud`. La configuration publique du projet `blocraft` est dans
`src/firebase-cloud.js` ; aucune clé de compte de service ni Analytics n'est ajouté.
`npm run test:cloud` teste le stockage transactionnel et les baux en mémoire ;
`npm run test:adminrealm` teste la coordination cloud simulée avec de vrais canaux
WebRTC. Les règles Firestore restent à déployer par le propriétaire :
[firebase/SETUP.md](firebase/SETUP.md). `npm audit` ne signale aucune vulnérabilité
après la mise à jour de Playwright et du transport gRPC indirect (non inclus dans
le bundle web).

### Fluidité mobile et multijoueur

Le rendu mobile démarre à un pixel de rendu par pixel CSS, avec une résolution et
une portée adaptatives. Deux mesures lentes successives réduisent la charge ; la
qualité ne remonte qu'après plusieurs secondes stables. La distance choisie reste
un plafond : elle peut être réduite temporairement pour préserver la fluidité.

Le streaming mobile effectue au maximum **une génération et un maillage par image**,
sans la rafale de maillages supplémentaires déclenchée auparavant par une grosse
file. Les tâches les plus proches passent d'abord, sans trier/copier toute la file.
Les budgets restent indicatifs : un chunk individuel est encore calculé sur le
thread principal et ne peut pas être interrompu au milieu de son calcul.

Autres réductions de travail : déchargement des chunks moins fréquent à l'arrêt,
mobs hors portée visuelle non dessinés (mais pas supprimés de la simulation),
particules météo moins nombreuses et moins fréquentes sur mobile, canvas météo
inactif non repeint, coordonnées à 10 Hz et étiquettes de joueurs réutilisées plutôt
que recréées à chaque image.

En réseau : positions immobiles envoyées seulement au heartbeat (~1 s), positions
mobiles jusqu'à ~12 Hz sur téléphone, snapshots de mobs à 8 Hz avec déduplication et
filtrage par voisinage pour les mondes Admin. Les véhicules immobiles ne renvoient
plus une copie complète des circuits en permanence ; les mises à jour partielles
préservent les circuits déjà reçus et un état complet est renvoyé après l'arrivée
effective du joueur. Les changements de circuits restent fiables.

Les positions/yaws affichés des avatars, bateaux et wagonnets sont interpolés entre
les messages, sans modifier les positions faisant autorité pour les interactions.
Les grands déplacements se recalent immédiatement. Quand un canal WebRTC accumule
des données, seuls les états remplaçables (poses, snapshots mobiles, etc.) sont
coalescés vers leur dernière valeur ; les blocs, le chat, le butin et les métadonnées
de circuits restent sur le canal fiable. Cela limite l'accumulation de positions
anciennes sans supprimer des modifications du monde.

`npm run test:performance` vérifie ces plafonds de travail, l'hystérésis, le
heartbeat, les files réseau bornées par type/joueur, la conservation des blocs et
circuits, et l'interpolation. `test:adminrealm` vérifie aussi le lissage sans modifier
la simulation et la réutilisation des étiquettes avec de vrais échanges WebRTC.
Ces contrôles ne constituent pas un benchmark FPS sur un téléphone physique.
Recharger le jeu sur **tous les appareils** après la mise à jour pour utiliser le
même format de snapshots partiels.

### Objets au sol, rituel et effets visuels

- **Jeter** : prends une pile dans l’inventaire puis utilise **Jeter ↓** (également sur mobile), ou clique dans le fond extérieur à la fenêtre. En jeu, **G** jette un objet de la case sélectionnée ; **Maj+G** jette la pile. Les quantités et l’usure des outils/armures sont conservées. Une sélection créative infinie produit un seul objet réel. Les objets jetés restent ramassables pendant cinq minutes ; le délai initial évite de les reprendre immédiatement. En multijoueur, l’hôte arbitre leur physique et chaque ramassage, y compris entre plusieurs Admins. Les inventaires restent toutefois gérés par les clients : ce n’est pas un système anti-triche.
- **Wagonnet** : approche-toi à moins de trois blocs et utilise le clic droit / bouton tactile **Poser / Utiliser**, même si ton viseur atteint le sol derrière le wagon. **X** ou Utiliser permet de descendre. Les sièges déjà occupés restent protégés ; avec un wagon en main, viser un autre rail permet toujours d’en poser un nouveau.
- **Herobrine** : construis une base **3 × 3 de blocs d’or**, pose **une torche de redstone sur chacun des quatre coins**, puis **un bloc de pierre au centre, juste au-dessus de l’or**. L’ordre de construction est libre. Laisse deux blocs d’air au-dessus de la pierre. La pierre est consommée à l’invocation, empêchant une réactivation automatique après rechargement ; Herobrine vivant est inclus dans la sauvegarde de la dimension active. Il possède un modèle à yeux blancs, poursuit les joueurs et peut être combattu. Le rituel ne fonctionne pas dans le Nether ou l’End.
- **Graphismes** : contours et reflets des armes, rivets/joints des armures et biseaux des blocs métalliques. Les torches éclairent les surfaces voisines avec une teinte chaude, même la nuit. Les quatre sources les plus proches sont retenues pour limiter le coût sur mobile ; cet éclairage local n’ajoute pas de projection d’ombres.
- **Fourneaux** : flammes animées et fumée montante tant que le combustible brûle, lumière locale et extinction des effets à l’arrêt. L’activité visuelle de l’hôte est partagée ; les particules restent calculées localement et plafonnées.
- **Monstres** : pas de génération naturelle de monstres dans le monde principal pendant la journée, y compris dans les grottes. Les monstres ordinaires exposés au soleil brûlent visiblement et perdent de la vie ; l’ombre et l’eau les protègent. Les créatures de feu, les boss et Herobrine sont immunisés ; le Nether et l’End gardent leurs règles propres.

Vérification dédiée : `npm run test:world-features` (Chromium/Playwright). Les tests multi-Admin exercent aussi les objets jetés, le ramassage unique et l’activité des fourneaux sur de vraies connexions WebRTC avec stockage cloud simulé. **Recharge le jeu sur tous les appareils après une mise à jour.**

## Contrôles, coffres et options sociales

- **Mobile / mono-bloc** : le bouton **Poser** permet d'utiliser ou de poser un bloc
  en visant au centre. Quand on vise le dessus du mono-bloc depuis ses pieds,
  le bloc de construction est posé sur une case latérale libre, et non dans le joueur.
- **Accroupissement** : `C` au clavier (touche reconfigurable) ou **Accroupi** sur
  mobile. Le déplacement ralentit, la caméra descend et le personnage évite de
  quitter le bord d'un bloc tant qu'il reste accroupi. En vol, `C` descend.
- **Coffres** : leur contenu est maintenant conservé par partie et par dimension,
  y compris après fermeture et sauvegarde. Casser puis reposer un coffre recrée
  un nouveau conteneur. En multijoueur, l'hôte attribue le butin pour empêcher
  deux retraits simultanés de la même récompense. Le dépôt dans un coffre partagé
  est pour l'instant réservé au navigateur hôte.
- **Chat vocal** : bouton **Micro** juste au-dessus du chat, en multijoueur ;
  le micro est **désactivé par défaut** et nécessite une autorisation du navigateur
  (HTTPS ou `localhost`). Un second appui coupe la capture. Le flux audio passe
  entre les navigateurs par WebRTC/PeerJS ; aucun enregistrement audio n'est fait.
  Comme le multijoueur, la voix dépend de la connectivité WebRTC et du navigateur.
- **Équipement bedrock** : épée, pioche et quatre pièces d'armure dans les
  recettes d'établi. La bedrock reste incassable en survie : cet équipement est
  destiné au mode créatif/aux Admins disposant de ce matériau.
- **Boutique** : quatre apparences de personnage gratuites pour le profil Admin,
  visibles dans l'aperçu 3D et sur les avatars multijoueurs. Aucun paiement.
  Le profil Admin peut activer un rendu à plus haute résolution/portée dans la
  boutique ; cette option peut ralentir un téléphone.
- **Amis · favoris locaux** : enregistre un pseudo et le nom **exact** de la
  partie de cet ami pour la rejoindre plus vite. Cette liste reste sur l'appareil :
  ce n'est ni une demande d'amitié mutuelle, ni un annuaire de joueurs ou une
  présence en ligne. L'hôte doit garder sa partie ouverte.

Les tests de logique associés sont inclus dans `npm test` ; les tests visuels
nécessitent un navigateur Chromium installé (`npm run test:site`, `npm run test:game`).
