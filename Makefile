# Makefile pour compiler les figures TikZ en PDF et SVG

TIKZ_DIR := img/tikz
PDF_DIR := img/pdf
SVG_DIR := img/svg
CONTOUR_DIR := img/contourdata
PREAMBLE := $(TIKZ_DIR)/_standalone_preamble.tex

# Trouver tous les fichiers TikZ (sauf le préambule)
TIKZ_SOURCES := $(wildcard $(TIKZ_DIR)/*-tikz-*.tex)
TIKZ_FILES := $(filter-out $(PREAMBLE), $(TIKZ_SOURCES))

# Générer les noms de PDF et SVG correspondants
PDF_TARGETS := $(patsubst $(TIKZ_DIR)/%.tex,$(PDF_DIR)/%.pdf,$(TIKZ_FILES))
SVG_TARGETS := $(patsubst $(TIKZ_DIR)/%.tex,$(SVG_DIR)/%.svg,$(TIKZ_FILES))

.PHONY: all figures svg clean cleanall help list rebuild dirs debug

# Par défaut : compiler toutes les figures en PDF
all: figures

# Debug : afficher les variables
debug:
	@echo "PREAMBLE existe ? $(wildcard $(PREAMBLE))"
	@echo "TIKZ_FILES:"
	@echo "$(TIKZ_FILES)" | tr ' ' '\n'
	@echo ""
	@echo "PDF_TARGETS:"
	@echo "$(PDF_TARGETS)" | tr ' ' '\n'
	@echo ""
	@echo "SVG_TARGETS:"
	@echo "$(SVG_TARGETS)" | tr ' ' '\n'

# Créer les répertoires
dirs:
	@mkdir -p $(TIKZ_DIR) $(PDF_DIR) $(SVG_DIR) $(CONTOUR_DIR)

# Compiler toutes les figures en PDF
figures: dirs $(PDF_TARGETS)
	@echo "✓ $(words $(PDF_TARGETS)) figure(s) PDF compilée(s)"

# Compiler toutes les figures en SVG
svg: dirs $(SVG_TARGETS)
	@echo "✓ $(words $(SVG_TARGETS)) figure(s) SVG compilée(s)"

# Règle de compilation PDF
$(PDF_DIR)/%.pdf: $(TIKZ_DIR)/%.tex $(PREAMBLE)
	@echo "Compilation PDF de $*..."
	@cd $(TIKZ_DIR) && ( \
		cat _standalone_preamble.tex > $*_tmp.tex && \
		echo '\\begin{document}' >> $*_tmp.tex && \
		cat $*.tex >> $*_tmp.tex && \
		echo '\\end{document}' >> $*_tmp.tex && \
		lualatex -interaction=nonstopmode -halt-on-error $*_tmp.tex > /dev/null 2>&1 \
	)
	@if [ -f $(TIKZ_DIR)/$*_tmp.pdf ]; then \
		mv $(TIKZ_DIR)/$*_tmp.pdf $@; \
		cd $(TIKZ_DIR) && rm -f $*_tmp.*; \
		echo "✓ $*.pdf créé"; \
	else \
		echo "✗ Erreur lors de la compilation de $*.tex"; \
		echo "Pour déboguer : cd $(TIKZ_DIR) && lualatex $*_tmp.tex"; \
		cd $(TIKZ_DIR) && rm -f $*_tmp.*; \
		exit 1; \
	fi

# Règle de compilation SVG
$(SVG_DIR)/%.svg: $(TIKZ_DIR)/%.tex $(PREAMBLE)
	@echo "Compilation SVG de $*..."
	@cd $(TIKZ_DIR) && ( \
		cat _standalone_preamble.tex > $*_tmp.tex && \
		echo '\\begin{document}' >> $*_tmp.tex && \
		cat $*.tex >> $*_tmp.tex && \
		echo '\\end{document}' >> $*_tmp.tex && \
		lualatex -interaction=nonstopmode -halt-on-error -output-format=dvi $*_tmp.tex > /dev/null 2>&1 && \
		dvisvgm --font-format=woff --exact --bbox=preview $*_tmp.dvi -o $*_tmp.svg > /dev/null 2>&1 \
	)
	@if [ -f $(TIKZ_DIR)/$*_tmp.svg ]; then \
		mv $(TIKZ_DIR)/$*_tmp.svg $@; \
		cd $(TIKZ_DIR) && rm -f $*_tmp.*; \
		echo "✓ $*.svg créé"; \
	else \
		echo "✗ Erreur lors de la compilation SVG de $*.tex"; \
		echo "Pour déboguer : cd $(TIKZ_DIR) && lualatex -output-format=dvi $*_tmp.tex && dvisvgm $*_tmp.dvi"; \
		cd $(TIKZ_DIR) && rm -f $*_tmp.*; \
		exit 1; \
	fi

# Compiler une figure spécifique en PDF
# Usage: make fig UUID=4R9m N=1
fig: dirs
	@if [ -z "$(UUID)" ] || [ -z "$(N)" ]; then \
		echo "Usage: make fig UUID=4R9m N=1"; \
		exit 1; \
	fi
	@$(MAKE) $(PDF_DIR)/$(UUID)-tikz-$(N).pdf

# Compiler une figure spécifique en SVG
# Usage: make fig-svg UUID=4R9m N=1
fig-svg: dirs
	@if [ -z "$(UUID)" ] || [ -z "$(N)" ]; then \
		echo "Usage: make fig-svg UUID=4R9m N=1"; \
		exit 1; \
	fi
	@$(MAKE) $(SVG_DIR)/$(UUID)-tikz-$(N).svg

# Nettoyer les fichiers temporaires
clean:
	@rm -f $(TIKZ_DIR)/*_tmp.* $(TIKZ_DIR)/*.aux $(TIKZ_DIR)/*.log $(TIKZ_DIR)/*.out
	@rm -f $(TIKZ_DIR)/*_contourtmp*.lua $(TIKZ_DIR)/*.dat $(TIKZ_DIR)/*.dvi
	@rm -f $(CONTOUR_DIR)/*.dat $(CONTOUR_DIR)/*.script $(CONTOUR_DIR)/*.table
	@echo "✓ Fichiers temporaires nettoyés"

# Nettoyer tout
cleanall: clean
	@rm -f $(PDF_DIR)/*-tikz-*.pdf
	@rm -f $(SVG_DIR)/*-tikz-*.svg
	@echo "✓ Tous les PDF et SVG supprimés"

# Recompiler tout en PDF
rebuild: cleanall figures

# Recompiler tout en SVG
rebuild-svg: cleanall svg

# Lister les figures
list:
	@echo "Figures TikZ disponibles :"
	@for f in $(TIKZ_DIR)/*-tikz-*.tex; do \
		[ -f "$$f" ] && echo "  - $$(basename $$f)"; \
	done || echo "  Aucune"
	@echo ""
	@echo "Figures PDF compilées :"
	@for f in $(PDF_DIR)/*-tikz-*.pdf; do \
		[ -f "$$f" ] && echo "  - $$(basename $$f)"; \
	done || echo "  Aucune"
	@echo ""
	@echo "Figures SVG compilées :"
	@for f in $(SVG_DIR)/*-tikz-*.svg; do \
		[ -f "$$f" ] && echo "  - $$(basename $$f)"; \
	done || echo "  Aucune"

# Aide
help:
	@echo "Commandes disponibles :"
	@echo "  make figures          - Compiler toutes les figures en PDF"
	@echo "  make svg              - Compiler toutes les figures en SVG"
	@echo "  make fig UUID=X N=Y   - Compiler une figure spécifique en PDF"
	@echo "  make fig-svg UUID=X N=Y - Compiler une figure spécifique en SVG"
	@echo "  make list             - Lister les figures"
	@echo "  make debug            - Afficher les variables"
	@echo "  make clean            - Nettoyer les fichiers temporaires"
	@echo "  make cleanall         - Supprimer tous les PDF et SVG"
	@echo "  make rebuild          - Recompiler tout en PDF"
	@echo "  make rebuild-svg      - Recompiler tout en SVG"
	@echo ""
	@echo "Exemples :"
	@echo "  make figures"
	@echo "  make svg"
	@echo "  make fig UUID=4R9m N=1"
	@echo "  make fig-svg UUID=4R9m N=2"
