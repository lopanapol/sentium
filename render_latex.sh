#!/bin/bash
# A script to render a LaTeX string as an image in the terminal.
#
# REQUIRES:
# 1. A LaTeX distribution (e.g., TeX Live, MiKTeX) to provide 'pdflatex'.
# 2. The 'dvipng' utility (usually included with LaTeX).
# 3. A compatible terminal and image viewer (e.g., iTerm2 with 'imgcat', kitty, wezterm).

# --- Dependency Check ---
if ! command -v pdflatex &> /dev/null; then
    echo "ERROR: 'pdflatex' command not found. Please install a LaTeX distribution."
    exit 1
fi
if ! command -v dvipng &> /dev/null; then
    echo "ERROR: 'dvipng' command not found. It is usually part of a LaTeX distribution."
    exit 1
fi
if ! command -v imgcat &> /dev/null; then
    echo "ERROR: 'imgcat' command not found. This script requires iTerm2 or a compatible terminal with shell integrations."
    exit 1
fi
if [ -z "$1" ]; then
    echo "Usage: $0 "<LaTeX_string>""
    echo "Example: $0 "\\frac{a}{b}""
    exit 1
fi

# --- Main Script ---
TMP_DIR=$(mktemp -d)
LATEX_INPUT="$1"
BASENAME="$TMP_DIR/texoutput"

# Create the LaTeX source file
cat << EOF > "$BASENAME.tex"
\documentclass[preview, border=2pt]{standalone}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{amssymb}
\begin{document}
$LATEX_INPUT
\end{document}
EOF

# Compile LaTeX to DVI, suppressing most output
pdflatex -output-directory="$TMP_DIR" -halt-on-error "$BASENAME.tex" > "$TMP_DIR/pdflatex.log"
if [ $? -ne 0 ]; then
    echo "ERROR: pdflatex failed. See log for details:"
    cat "$TMP_DIR/pdflatex.log"
    rm -rf "$TMP_DIR"
    exit 1
fi

# Convert DVI to a tightly cropped PNG
dvipng -D 200 -T tight -o "$BASENAME.png" "$BASENAME.dvi" > /dev/null

# Display the image in the terminal
imgcat "$BASENAME.png"

# Clean up temporary files
rm -rf "$TMP_DIR"
