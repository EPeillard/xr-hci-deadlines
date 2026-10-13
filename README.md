# Conférences · XR & IHM

Première version d’une veille pour les étudiants, doctorants et collègues d’Étienne Peillard. Interface française, sans dépendances web ni compte utilisateur.

## Contenu et fonctionnement

- Catalogue éditorial : XR, perception, incarnation, IHM, robotique, haptique, facteurs humains et informatique graphique.
- Réseaux français et européens inclus : IHM, jf·XR / GT-RV, RJC-IHM, GDR IHM, jFIG, SELF, EuroXR, EuroHaptics, ECVP, NordiCHI et BritCHI.
- Trois vues : échéances de soumission, dates des rencontres, catalogue de conférences à suivre.
- Filtres par thème, communauté, lieu de l’édition et contribution ; favoris conservés dans le navigateur.
- Export des résultats affichés en ICS. Les échéances sont des événements d’une minute à l’heure limite ; les rencontres sont des événements en jours entiers.
- Les heures de soumission sont affichées en Europe/Paris. Les timestamps AoE portent explicitement le décalage UTC−12.

La communauté d’une conférence est différente de son lieu : TEI est une conférence internationale dont l’édition 2027 se tient en Europe. Le filtre de lieu « Europe » comprend la France.

## État initial au 13 octobre 2026

Cette sélection est une base à compléter, pas un inventaire exhaustif. Sept éditions ont des dates vérifiées : IEEE VR 2027, TEI 2027, IHM 2026, jf·XR / GT-RV 2026, EuroXR 2026, SELF 2026 et NordiCHI 2026. Les autres entrées sont des familles à suivre ; aucune échéance n’a été extrapolée. Les liens du catalogue non consultés sont explicitement marqués à vérifier.

Les échéances principales de soumission sont séparées par format. Notifications, révisions et camera-ready ne sont pas intégrées à la vue de soumission. Certains formats ne sont pas encore renseignés. L’absence de date ne signifie pas que l’appel est ouvert ou fermé. Les rappels sont des exports ponctuels, sans synchronisation ni mises à jour automatiques.

## Mettre sur GitHub Pages

1. Créer un dépôt `xr-ihm-deadlines` dans le compte ou l’organisation de votre choix, avec une branche principale `main`.
2. Ajouter le contenu de ce dossier à la racine, y compris `.github/workflows/pages.yml`.
3. Dans **Settings → Pages → Build and deployment**, choisir **GitHub Actions**.
4. Le workflow construit et publie le site à chaque modification de `main`.

Le dépôt est [EPeillard/xr-ihm-deadlines](https://github.com/EPeillard/xr-ihm-deadlines). Une fois GitHub Pages activé avec GitHub Actions, le site est publié à https://epeillard.github.io/xr-ihm-deadlines/.

## Modifier les conférences

`conferences.json` est la source de référence. Modifier le catalogue dans `families` et les éditions dans `editions`. Le workflow génère automatiquement le fichier `data.js` de la version publiée. Le `data.js` à la racine est uniquement l’instantané fourni pour l’ouverture locale ; le régénérer pour refléter une modification locale.

```sh
node tests/check.cjs
python3 scripts/build.py
python3 -m http.server 8000 --directory dist
```

Le site fonctionne aussi en ouvrant directement `index.html`, avec l’instantané initial de `data.js`.

Pour les modalités de contribution et la structure des données, voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Origine

L’idée d’une liste de deadlines pour un laboratoire vient de [mkono505/hcideadlines](https://github.com/mkono505/hcideadlines). Cette implémentation est nouvelle : aucun code, contenu historique ou asset du dépôt n’est repris. Les dates vérifiées sont accompagnées des liens de leurs appels officiels dans les données.

Code fourni sous licence MIT. La mise en page n’a pas fait l’objet d’un test visuel dans un navigateur dans cet environnement ; validation de la structure des données, des filtres et de l’export ICS par les contrôles inclus.
