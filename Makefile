# Makefile pour compiler les figures TikZ

TIKZ_DIR := img/tikz
PDF_DIR := img/pdf
CONTOUR_DIR := img/contourdata
PREAMBLE := $(TIKZ_DIR)/_standalone_preamble.tex

# Trouver tous les fichiers TikZ (sauf le préambule)
TIKZ_SOURCES := $(wildcard $(TIKZ_DIR)/*-tikz_*.tex)
TIKZ_FILES := $(filter-out $(PREAMBLE), $(TIKZ_SOURCES))

# Générer les noms de PDF correspondants
PDF_TARGETS := $(patsubst $(TIKZ_DIR)/%.tex,$(PDF_DIR)/%.pdf,$(TIKZ_FILES))

.PHONY: all figures clean cleanall help list rebuild dirs debug

# Par défaut : compiler toutes les figures
all: figures

# Debug : afficher les variables
debug:
	@echo "PREAMBLE existe ? $(wildcard $(PREAMBLE))"
	@echo "TIKZ_FILES:"
	@echo "$(TIKZ_FILES)" | tr ' ' '\n'
	@echo ""
	@echo "PDF_TARGETS:"
	@echo "$(PDF_TARGETS)" | tr ' ' '\n'

# Créer les répertoires
dirs:
	@mkdir -p $(TIKZ_DIR) $(PDF_DIR) $(CONTOUR_DIR)

# Compiler toutes les figures
figures: dirs $(PDF_TARGETS)
	@echo "✓ $(words $(PDF_TARGETS)) figure(s) compilée(s)"

# Règle de compilation
$(PDF_DIR)/%.pdf: $(TIKZ_DIR)/%.tex $(PREAMBLE)
	@echo "Compilation de $*..."
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

# Compiler une figure spécifique
# Usage: make fig UUID=4R9m N=1
fig: dirs
	@if [ -z "$(UUID)" ] || [ -z "$(N)" ]; then \
		echo "Usage: make fig UUID=4R9m N=1"; \
		exit 1; \
	fi
	@$(MAKE) $(PDF_DIR)/$(UUID)-tikz_$(N).pdf

# Nettoyer les fichiers temporaires
clean:
	@rm -f $(TIKZ_DIR)/*_tmp.* $(TIKZ_DIR)/*.aux $(TIKZ_DIR)/*.log $(TIKZ_DIR)/*.out
	@rm -f $(TIKZ_DIR)/*_contourtmp*.lua $(TIKZ_DIR)/*.dat
	@rm -f $(CONTOUR_DIR)/*.dat $(CONTOUR_DIR)/*.script $(CONTOUR_DIR)/*.table
	@echo "✓ Fichiers temporaires nettoyés"

# Nettoyer tout
cleanall: clean
	@rm -f $(PDF_DIR)/*-tikz_*.pdf
	@echo "✓ Tous les PDF supprimés"

# Recompiler tout
rebuild: cleanall figures

# Lister les figures
list:
	@echo "Figures TikZ disponibles :"
	@for f in $(TIKZ_DIR)/*-tikz_*.tex; do \
		[ -f "$$f" ] && echo "  - $$(basename $$f)"; \
	done || echo "  Aucune"
	@echo ""
	@echo "Figures PDF compilées :"
	@for f in $(PDF_DIR)/*-tikz_*.pdf; do \
		[ -f "$$f" ] && echo "  - $$(basename $$f)"; \
	done || echo "  Aucune"

# Aide
help:
	@echo "Commandes disponibles :"
	@echo "  make figures          - Compiler toutes les figures"
	@echo "  make fig UUID=X N=Y   - Compiler une figure spécifique"
	@echo "  make list             - Lister les figures"
	@echo "  make debug            - Afficher les variables"
	@echo "  make clean            - Nettoyer les fichiers temporaires"
	@echo "  make cleanall         - Supprimer tous les PDF"
	@echo "  make rebuild          - Recompiler tout"
	@echo ""
	@echo "Exemples :"
	@echo "  make fig UUID=4R9m N=1"
	@echo "  make fig UUID=4R9m N=2"