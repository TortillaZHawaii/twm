## Co można zamieścić w raporcie

- polepszenie wykrywanie szóstek:
    - metoda próbkowania - sprawdzamy czy w przewidywanych punktach jest biały pixel
    - closing/opening - żeby zamknąć każdą czarną kropkę
    - zwiększenie rozdzielczości - nwm czy możliwe
    - dogłębne badanie wysokości, szerokości w celu zbadania czy dwie kropki nie są sklejone w jeden kontur
- polepszenie wykrywania kolorów
    - teraz jest problem głównie z zielonym, bo się miesza z innymi kolorami
    - obecnie jest maska na każdy kolor osobno
    - próba zrobienia global maski na wszystkie kolory i później branie średniej z maski i porównanie dystansu do jednego z przewidywanych kolorowów wzorcowych
    - balans bieli - na planszy jest dużo szarego - można wyznaczyć kilka pkt na plansszy, pobrać ich wartości i skorygować obraz tak, żeby rzeczywiście szary był szary

- wykrywanie kamyczków
    - ???

- wykrywanie kart
    - too much effort imo