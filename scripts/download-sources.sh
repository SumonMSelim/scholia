#!/usr/bin/env bash
# Downloads the openly licensed demo course material into data/raw/.
# MIT OCW 6.0001 Fall 2016 (CC BY-NC-SA 4.0) and Think Python 2e (CC BY-NC 3.0).
set -euo pipefail
cd "$(dirname "$0")/.."
OCW=https://ocw.mit.edu
C=$OCW/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016
RAW=data/raw
mkdir -p $RAW/lectures $RAW/slides $RAW/psets $RAW/book

# Resolve the first .pdf (or given extension) linked from an OCW resource page.
resolve() { curl -sL "$1" | { grep -oE "/courses/[^\"']*\.$2" || true; } | head -1; }
fetch() { [ -f "$2" ] || curl -sL "$1" -o "$2"; }

LECTURES=(
  "1 what-is-computation"
  "2 branching-and-iteration"
  "3 string-manipulation-guess-and-check-approximations-bisection"
  "4 decomposition-abstraction-and-functions"
  "5 tuples-lists-aliasing-mutability-and-cloning"
  "6 recursion-and-dictionaries"
  "7 testing-debugging-exceptions-and-assertions"
  "8 object-oriented-programming"
  "9 python-classes-and-inheritance"
  "10 understanding-program-efficiency-part-1"
  "11 understanding-program-efficiency-part-2"
  "12 searching-and-sorting"
)
for entry in "${LECTURES[@]}"; do
  n=${entry%% *}; slug=${entry#* }
  page="$C/resources/lecture-$n-$slug/"
  html=$(curl -sL "$page")
  vtt=$(echo "$html" | grep -oE "/courses/[^\"']*\.vtt" | head -1)
  yt=$(echo "$html" | grep -oE "youtube\.com/embed/[A-Za-z0-9_-]+" | head -1 | sed 's|.*/||')
  mp4=$(echo "$html" | grep -oE "https://archive\.org/download/[^\"']*\.mp4" | head -1)
  [ -n "$vtt" ] && fetch "$OCW$vtt" "$RAW/lectures/lec$n.vtt"
  printf '%s\t%s\t%s\t%s\n' "$n" "$yt" "$mp4" "$page" >> "$RAW/lectures/index.tsv"
  pdf=$(resolve "$C/resources/mit6_0001f16_lec$n/" pdf)
  [ -n "$pdf" ] && fetch "$OCW$pdf" "$RAW/slides/lec$n.pdf"
  echo "lecture $n: vtt=${vtt:+ok} slides=${pdf:+ok} yt=$yt"
done

for n in 0 1 2 3 4 5; do
  zip=""; slug="ps$n"; [ $n = 1 ] && slug="mit6_0001f16_ps1"
  pdf=$(resolve "$C/resources/$slug/" pdf)
  if [ -n "$pdf" ]; then
    fetch "$OCW$pdf" "$RAW/psets/ps$n.pdf"
  else
    zip=$(resolve "$C/resources/$slug/" zip)
    [ -n "$zip" ] && fetch "$OCW$zip" "$RAW/psets/ps$n.zip"
  fi
  echo "pset $n: pdf=${pdf:+ok} zip=${zip:-}"
done

fetch "$C/pages/syllabus/" $RAW/syllabus.html
fetch https://greenteapress.com/thinkpython2/thinkpython2.pdf $RAW/book/thinkpython2.pdf
echo "book: $(stat -f%z $RAW/book/thinkpython2.pdf 2>/dev/null || stat -c%s $RAW/book/thinkpython2.pdf) bytes"
