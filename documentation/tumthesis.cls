% ==============================================================================
% tumthesis.cls
% A class for creating theses
% Michael Ritter, 2012
% Licence: 
% This work may be distributed and/or modified under the
% conditions of the LaTeX Project Public License, either version 1.3
% of this license or (at your option) any later version.
% The latest version of this license is in
% http://www.latex-project.org/lppl.txt
% and version 1.3 or later is part of all distributions of LaTeX
% version 2005/12/01 or later.
% ==============================================================================
\NeedsTeXFormat{LaTeX2e}%
\ProvidesClass{tumthesis}%

% ------------------------------------------------------------------------------
% Options for Picture on Titlepage
%        titlepicture = logo.png: Name of the Image File to be shown
%        titlepictureX = 20mm: horizontal distance of the lower right corner of picture to lower right corner of titlepage
%        titlepageY = 20mm: vertical distance of the lower right corner of picture to lower right corner of titlepage
%        topmath: if option is given, "TopMath Bildmotiv" will be shown on titlepage
%        theoremtitle = break: If set to "nobreak", the title of a theorem is typeset next to its name; If set to "break", it is typeset on the next line.
%        biblatexBackend: see parameter "backend" of package "biblatex", default: biber.
%
\RequirePackage{kvoptions}
\DeclareStringOption[]{titlepicture}
\DeclareStringOption[0 mm]{titlepictureX}
\DeclareStringOption[0 mm]{titlepictureY}
\DeclareStringOption[break]{theoremtitle}
\DeclareStringOption[biber]{biblatexBackend}
\ProcessKeyvalOptions*
\providecommand{\tumthesis@placeTitlepicture}{}
\unless\ifx\tumthesis@titlepicture\@empty\renewcommand{\tumthesis@placeTitlepicture}{
    \node[anchor=south east]%
    at ($ (current page.south east) + (-\tumthesis@titlepictureX, \tumthesis@titlepictureY) $)%
    {%
        \includegraphics{\tumthesis@titlepicture}
    };%
}
\fi
\DeclareOption{topmath}{\renewcommand{\tumthesis@placeTitlepicture}{
    \node[anchor=south east]%
    at ($ (current page.south east) + (128.5mm, -45mm) $)%
    {%
        \includegraphics{TopMath-Bildmotiv.jpg}
    };%
}}
\ProcessOptions\relax

% ------------------------------------------------------------------------------
\LoadClass[% based on scrbook
    fontsize=11pt, %font size
    paper=a4, %paper format
    headsepline, %separating line for header
    chapterprefix, % produce "Chapter ..."
    numbers=noenddot, % no full-stop after last number
    listof=totoc, %Entry in table of contents for list of figures/tables
    index=totoc, %Entry in table of contents for index
    bibliography=totoc, %Entry in table of contents for bibliography
    BCOR=5mm %Binding correction, ensures sufficient space for binding
    ]%
{scrbook}%

% ------------------------------------------------------------------------------
% Basic Packages
\RequirePackage{scrbase} %Hilfsfunktionen
\usepackage{ellipsis, fixltx2e, mparhack, ragged2e} %bugfixing
\RequirePackage[l2tabu, orthodox]{nag} %avoid typical LaTeX errors
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
% Languages, Fonts, Encoding
\RequirePackage[ngerman,english]{babel} %use German and English languages
\RequirePackage[T1]{fontenc} %fonts
\RequirePackage{lmodern}
\RequirePackage[utf8]{inputenc} % Unicode input
\RequirePackage[final]{microtype} %microtypography
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
% graphics and colors
\RequirePackage{graphicx}
\RequirePackage{subcaption}
\RequirePackage{tikz}
\usetikzlibrary{calc}
\RequirePackage{tumcolors2}
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
% quotation marks
\RequirePackage[autostyle=true]{csquotes}
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
%Bibliography
\RequirePackage[%
    backend=\tumthesis@biblatexBackend, %
    citestyle=alphabetic, %
    bibstyle=alphabetic, %
    defernumbers=true, %
    hyperref=true, %
    maxbibnames=20, %
    maxcitenames=3, %
    url=false, %
    doi=false, %
    firstinits=true,
    sorting=nty]%
{biblatex}
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
%Mathematics
\RequirePackage{amsmath, amssymb}
\RequirePackage[hyperref, amsmath, thmmarks]{ntheorem}
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
%Tables
\RequirePackage{tabularx}
\RequirePackage{booktabs}
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
% Misc. other packages
\RequirePackage{xspace} % auto-spacing for abbreviations
\RequirePackage[marginclue,langtrack]{fixme} % Fixme und todo-notes
\RequirePackage[]{listings} %typeset listings
\lstset{% settings for listings
  basicstyle=\small\ttfamily, %small type
  tabsize=2, % Tabs produce two spaces
  keywordstyle=\bfseries, % key words bold
  identifierstyle=, % don't highlight identifier
  stringstyle=\color{green}, % strings in green
  commentstyle=\itshape\color{gray}, %comments italic and grey
  frame=none, % no frame
  breaklines=true, % automatic line breaks
  breakatwhitespace=true, % only break at space
  prebreak=\raisebox{0ex}[0ex][0ex]
  {\ensuremath{\curvearrowright}}, %show line breaks with arrows
  postbreak={\raisebox{0ex}[0ex][0ex]
    {\ensuremath{\hookrightarrow\space}}},  %show line breaks with arrows
  numbers=left, %line numbers on the left...
  stepnumber=5, % ... every 5 lines...
  numberstyle=\tiny, % ... very small...
  numbersep=2pt, %... at 2pt distance from text ...
  numberfirstline=false, % ... no line number in the first line ...
  firstnumber=1, % ... needed for the above command to work
  literate=% symbol replacement for umlauts (re. UTF-8-Problemen)
  {Ö}{{\"O}}1%
  {Ä}{{\"A}}1%
  {Ü}{{\"U}}1%
  {ß}{{\ss}}1%
  {ü}{{\"u}}1%
  {ä}{{\"a}}1%
  {ö}{{\"o}}1%
  {É}{{\'E}}1%
  {é}{{\'e}}1%
  {~}{{\textasciitilde}}1%
}%
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
% Index (must be loaded after fixme)
\RequirePackage[xindy]{imakeidx}
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
% placement settings
%
% default placement of figures, tables, algorithms
\setcounter{topnumber} {1}%
\setcounter{bottomnumber} {1}%
\renewcommand{\floatpagefraction}{0.8}%
\renewcommand{\topfraction} {0.8}%
\renewcommand{\bottomfraction} {0.5}%
\renewcommand{\textfraction} {0.15}%
\setlength{\@fptop}{0pt}
\renewcommand{\fps@figure}{htbp}%
\renewcommand{\fps@table}{htbp}%

% correct placement of footnotes
\RequirePackage[bottom]{footmisc}
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
% style of figure captions
\RequirePackage{caption}
\captionsetup{font=small, labelfont={small,bf}}
% ------------------------------------------------------------------------------

% ==============================================================================
% Kommandos für Bezeichnungen in Schlüssel-Wert-Syntax, vgl. scrguide Kapitel
% 10.2 und titlepage.sty von Markus Kohm
% ==============================================================================
% key handling
\DefineFamily{title} %definiere Familie title
\DefineFamilyMember{title} %füge Familienmitglied tumthesis.cls hinzu
                           %(Default-Wert für family member)
\newcommand*{\TitleOptions}{\FamilyOptions{title}} %setzt mehrere Optionen mit
                                %der Syntax Schlüssel={Wert}, AndererSchlüssel={Wert}
\newcommand*{\TitleOption}{\FamilyOption{title}} %setzt eine Option mit der
                                %Syntax {Schlüssel}{Wert}
% provide commands to set title key as well as define the key itself
\newcommand*{\tp@dokeys}{}
\newcommand*{\DefineSimpleTitleKey}[2][.\@currname.\@currext]{%
  \l@addto@macro\tp@dokeys{\do{#2}}%
  \expandafter\newcommand\expandafter*\csname @#2\endcsname{}%
  \expandafter\newcommand\expandafter*\csname #2\endcsname[1]{%
    \expandafter\gdef\csname @#2\endcsname{##1}}%
  \DefineFamilyKey[{#1}]{title}{#2}{\csname #2\endcsname{##1}}%
}%

% Ersetzungen in Schlüsseln definieren (z.B. kann man so die Schlüssel student
% und author synonym verwenden)
\newcommand*{\tp@replacewarning}[2]{%
  \PackageWarning{tumthesis}{%
    using `#2' instead of `#1',\MessageBreak
    because `#1' not defined%
  }%
}
\newcommand*{\DefineReplaceTitleKey}[3][.\@currname.\@currext]{%
  \DefineFamilyKey[{#1}]{title}{#2}{%
    \tp@replacewarning{#2}{#3}%
    \FamilyOptions{title}{#3=##1}%
  }%
}

% title, subtitle author und date durch neue Versionen ersetzen
\let\@title\relax\let\title\relax\DefineSimpleTitleKey{title} %Arbeitstitel
\let\@subtitle\relax\let\subtitle\relax\DefineSimpleTitleKey{subtitle} %Untertitel
\let\@author\relax\let\author\relax\DefineSimpleTitleKey{author} %Autor
                                %(=BearbeiterIn)
\DefineReplaceTitleKey{student}{author} %author = student
\DefineSimpleTitleKey{advisor}
\let\@date\relax\let\date\relax\DefineSimpleTitleKey{date} %Abgabedatum
\DefineSimpleTitleKey{faculty} %Fakultät
\DefineSimpleTitleKey{institute} %Institut / Lehrstuhl
\DefineSimpleTitleKey{professor} %Themensteller
\DefineSimpleTitleKey{place} %Ortsangabe (für die Erklärung)
% Art der Arbeit (bachelor, master, diploma, idp, seminar, project)
\providecommand*{\@subject}{}
\providecommand*{\setsubject}[1]{\gdef\@subject{#1}}
\l@addto@macro\tp@dokeys{\do{subject}}%
\DefineFamilyKey{title}{subject}{%
  \ifstr{#1}{project}{\setsubject{\tumthesis@projectpapername}}{%
    \ifstr{#1}{seminar}{\setsubject{\tumthesis@seminarpapername}}{%
      \ifstr{#1}{diploma}{\setsubject{\tumthesis@diplomathesisname}}{%
        \ifstr{#1}{idp}{\setsubject{\tumthesis@idpreportname}}{%
          \ifstr{#1}{master}{\setsubject{\tumthesis@masterthesisname}}{%
            \ifstr{#1}{bachelor}{\setsubject{\tumthesis@bachelorthesisname}}{%
              \setsubject{#1}%
            }%
          }%
        }%
      }%
    }%
  }%
}
\DefineSimpleTitleKey{chairman}	% Vorsitzender, Doktorarbeit
\DefineSimpleTitleKey{examiners}% Prüfer, Doktorarbeit. Durch Komma getrennt
\DefineSimpleTitleKey{acceptanceDate} % Datum der Annahme durch den Fakultätsrat, Doktorarbeit

\FamilyProcessOptions*\relax
\providecommand*{\subject}[1]{}
\renewcommand*{\subject}[1]{\TitleOption{subject}{#1}}

% ______________________________________________________________________________
% Makros für Bezeichnungen

\providecommand*\tumthesis@projectpapername{Projektbericht}%
\providecommand*\tumthesis@seminarpapername{Seminarausarbeitung}%
\providecommand*\tumthesis@diplomathesisname{Diplomarbeit}%
\providecommand*\tumthesis@masterthesisname{Master's Thesis}%
\providecommand*\tumthesis@bachelorthesisname{Bachelor's Thesis}%
\providecommand*\tumthesis@idpreportname{Abschlussbericht für ein interdisziplinäres
  Projekt}%
\providecommand*\examinername{Themensteller}%
\providecommand*\advisorname{Betreuer}%
\providecommand*\submissiondatename{Abgabedatum}%
\providecommand*\placedateseparator{,~den}%
\providecommand*{\fromname}{from}%
\providecommand*\declarationtext{Hiermit erkläre ich, dass ich diese Arbeit
  selbstständig angefertigt und nur die angegebenen Quellen und Hilfsmittel
  verwendet habe.}%
\providecommand*{\tumthesis@theoremname}{Theorem}%
\providecommand*{\tumthesis@theoremnameplural}{Theorems}%
\providecommand*{\tumthesis@lemmaname}{Lemma}%
\providecommand*{\tumthesis@lemmanameplural}{Lemmata}%
\providecommand*{\tumthesis@propositionname}{Proposition}%
\providecommand*{\tumthesis@propositionnameplural}{Propositions}%
\providecommand*{\tumthesis@corollaryname}{Corollary}%
\providecommand*{\tumthesis@corollarynameplural}{Corollaries}%
\providecommand*{\tumthesis@conjecturename}{Conjecture}%
\providecommand*{\tumthesis@conjecturenameplural}{Conjectures}%
\providecommand*{\tumthesis@remarkname}{Remark}%
\providecommand*{\tumthesis@remarknameplural}{Remarks}%
\providecommand*{\tumthesis@definitionname}{Definition}%
\providecommand*{\tumthesis@definitionnameplural}{Definitions}%
\providecommand*{\tumthesis@problemname}{Problem}%
\providecommand*{\tumthesis@problemnameplural}{Problems}%
\providecommand*{\tumthesis@examplename}{Example}%
\providecommand*{\tumthesis@examplenameplural}{Examples}%
\providecommand*{\tumthesis@proofname}{Proof}%
\providecommand*{\tumthesis@proofnameplural}{Proofs}%
% ______________________________________________________________________________
% Abbreviations
%Abkuerzungen
\def\@AbbrevIe{\iflanguage{ngerman}{d.\,h.}{\iflanguage{german}{d.\,h.}{i.\,e.}}}
\def\@AbbrevEg{\iflanguage{ngerman}{z.\,B.}{\iflanguage{german}{z.\,B.}{e.\,g.}}}
\def\@AbbrevWlog{\iflanguage{ngerman}{o.\,B.\,d.\,A.}{\iflanguage{german}{o.\,B.\,d.\,A.}{w.\,l.\,o.\,g.}}}
\def\@AbbrevSt{\iflanguage{ngerman}{u.\,d.\,N.}{\iflanguage{german}{u.\,d.\,N.}{s.\,t.}}}
\def\@AbbrevWrt{\iflanguage{ngerman}{bzgl.}{\iflanguage{german}{bzgl.}{w.\,r.\,t.}}}
\def\@AbbrevAi{\iflanguage{ngerman}{a.\,u.}{\iflanguage{german}{a.\,u.}{a.\,i.}}}
\def\@AbbrevLi{\iflanguage{ngerman}{l.\,u.}{\iflanguage{german}{l.\,u.}{l.\,i.}}}
\def\@AbbrevCf{\iflanguage{ngerman}{vgl.}{\iflanguage{german}{vgl.}{cf.}}}


\providecommand{\oBdA}{\@AbbrevWlog\xspace}%
\providecommand{\Wlog}{\@AbbrevWlog\xspace}%
\providecommand{\wlog}{\@AbbrevWlog\xspace}%
\providecommand{\ie}{\@AbbrevIe\xspace}%
\providecommand{\eg}{\@AbbrevEg\xspace}%
\providecommand{\st}{\@AbbrevSt\xspace}%
\providecommand{\wrt}{\@AbbrevWrt\xspace}%
\providecommand{\tfae}{\@AbbrevTfae\xspace}%
\providecommand{\ai}{\@AbbrevAi\xspace}%
\providecommand{\li}{\@AbbrevLi\xspace}%
\providecommand{\cf}{\@AbbrevCf\xspace}%

% ______________________________________________________________________________
% Übersetzungen

\AtBeginDocument{%
  %Englisch
  \providecaptionname{english}\tumthesis@projectpapername{Project Report}%
  \providecaptionname{english}\tumthesis@seminarpapername{Seminar Summary}%
  \providecaptionname{english}\tumthesis@diplomathesisname{Diploma Thesis}%
  \providecaptionname{english}\tumthesis@masterthesisname{Master's Thesis}%
  \providecaptionname{english}\tumthesis@bachelorthesisname{Bachelor's Thesis}%
  \providecaptionname{english}\tumthesis@idpreportname{Final Report for an Interdisciplinary Project}%
  \providecaptionname{english}\examinername{Examiner}%
  \providecaptionname{english}\advisorname{Advisor}%
  \providecaptionname{english}\submissiondatename{Submission Date}%
  \providecaptionname{english}\faculty{Fakultät für Mathematik}%
  \providecaptionname{english}\placedateseparator{,}%
  \providecaptionname{english}\fromname{by}%
  \providecaptionname{english}\declarationtext{I hereby confirm that this is my own work, and that I used only the cited sources and materials.}%
  \providecaptionname{english}{\tumthesis@theoremname}{Theorem}%
  \providecaptionname{english}{\tumthesis@theoremnameplural}{Theorems}%
  \providecaptionname{english}{\tumthesis@lemmaname}{Lemma}%
  \providecaptionname{english}{\tumthesis@lemmanameplural}{Lemmata}%
  \providecaptionname{english}{\tumthesis@propositionname}{Proposition}%
  \providecaptionname{english}{\tumthesis@propositionnameplural}{Propositions}%
  \providecaptionname{english}{\tumthesis@corollaryname}{Corollary}%
  \providecaptionname{english}{\tumthesis@corollarynameplural}{Corollaries}%
  \providecaptionname{english}{\tumthesis@conjecturename}{Conjecture}%
  \providecaptionname{english}{\tumthesis@conjecturenameplural}{Conjectures}%
  \providecaptionname{english}{\tumthesis@remarkname}{Remark}%
  \providecaptionname{english}{\tumthesis@remarknameplural}{Remarks}%
  \providecaptionname{english}{\tumthesis@definitionname}{Definition}%
  \providecaptionname{english}{\tumthesis@definitionnameplural}{Definitions}%
  \providecaptionname{english}{\tumthesis@problemname}{Problem}%
  \providecaptionname{english}{\tumthesis@problemnameplural}{Problems}%
  \providecaptionname{english}{\tumthesis@examplename}{Example}%
  \providecaptionname{english}{\tumthesis@examplenameplural}{Examples}%
  \providecaptionname{english}{\tumthesis@proofname}{Proof}%
  \providecaptionname{english}{\tumthesis@proofnameplural}{Proofs}%
  \providecaptionname{english}{\tumthesis@algocfname}{Algorithm}%
  \providecaptionname{english}{\tumthesis@algocfnameplural}{Algorithms}%
% 
  %Deutsch (german)
  \providecaptionname{german}\tumthesis@projectpapername{Projektbericht}%
  \providecaptionname{german}\tumthesis@seminarpapername{Seminarausarbeitung}%
  \providecaptionname{german}\tumthesis@diplomathesisname{Diplomarbeit}%
  \providecaptionname{german}\tumthesis@masterthesisname{Masterarbeit}%
  \providecaptionname{german}\tumthesis@bachelorthesisname{Bachelorarbeit}%
  \providecaptionname{german}\tumthesis@idpreportname{Abschlussbericht für ein
    interdisziplinäres Projekt}%
  \providecaptionname{german}\examinername{Themensteller}%
  \providecaptionname{german}\advisorname{Betreuer}%
  \providecaptionname{german}\submissiondatename{Abgabedatum}%
  \providecaptionname{german}\placedateseparator{,~den}%
  \providecaptionname{german}\fromname{von}%
  \providecaptionname{german}\declarationtext{Hiermit erkläre ich, dass ich
    diese Arbeit selbstständig angefertigt und nur die angegebenen Quellen und
    Hilfsmittel verwendet habe.}%
  \providecaptionname{german}{\tumthesis@theoremname}{Satz}%
  \providecaptionname{german}{\tumthesis@theoremnameplural}{Sätze}%
  \providecaptionname{german}{\tumthesis@lemmaname}{Lemma}%
  \providecaptionname{german}{\tumthesis@lemmanameplural}{Lemmata}%
  \providecaptionname{german}{\tumthesis@propositionname}{Proposition}%
  \providecaptionname{german}{\tumthesis@propositionnameplural}{Propositionen}%
  \providecaptionname{german}{\tumthesis@corollaryname}{Korollar}%
  \providecaptionname{german}{\tumthesis@corollarynameplural}{Korollare}%
  \providecaptionname{german}{\tumthesis@conjecturename}{Vermutung}%
  \providecaptionname{german}{\tumthesis@conjecturenameplural}{Vermutungen}%
  \providecaptionname{german}{\tumthesis@remarkname}{Bemerkung}%
  \providecaptionname{german}{\tumthesis@remarknameplural}{Bemerkungen}%
  \providecaptionname{german}{\tumthesis@definitionname}{Definition}%
  \providecaptionname{german}{\tumthesis@definitionnameplural}{Definitionen}%
  \providecaptionname{german}{\tumthesis@problemname}{Problem}%
  \providecaptionname{german}{\tumthesis@problemnameplural}{Probleme}%
  \providecaptionname{german}{\tumthesis@examplename}{Beispiel}%
  \providecaptionname{german}{\tumthesis@examplenameplural}{Beispiele}%
  \providecaptionname{german}{\tumthesis@proofname}{Beweis}%
  \providecaptionname{german}{\tumthesis@proofnameplural}{Beweise}%
  \providecaptionname{german}{\tumthesis@algocfname}{Algorithmus}%
  \providecaptionname{german}{\tumthesis@algocfnameplural}{Algorithmen}%
%
  %Deutsch (ngerman)
  \providecaptionname{ngerman}\tumthesis@projectpapername{Projektbericht}%
  \providecaptionname{ngerman}\tumthesis@seminarpapername{Seminarausarbeitung}%
  \providecaptionname{ngerman}\tumthesis@diplomathesisname{Diplomarbeit}%
  \providecaptionname{ngerman}\tumthesis@masterthesisname{Masterarbeit}%
  \providecaptionname{ngerman}\tumthesis@bachelorthesisname{Bachelorarbeit}%
  \providecaptionname{ngerman}\tumthesis@idpreportname{Abschlussbericht für ein
    interdisziplinäres Projekt}%
  \providecaptionname{ngerman}\examinername{Themensteller}%
  \providecaptionname{ngerman}\advisorname{Betreuer}%
  \providecaptionname{ngerman}\submissiondatename{Abgabedatum}%
  \providecaptionname{ngerman}\placedateseparator{,~den}%
  \providecaptionname{ngerman}\fromname{von}%
  \providecaptionname{ngerman}\declarationtext{Hiermit erkläre ich, dass ich
    diese Arbeit selbstständig angefertigt und nur die angegebenen Quellen und
    Hilfsmittel verwendet habe.}%
  \providecaptionname{ngerman}{\tumthesis@theoremname}{Satz}%
  \providecaptionname{ngerman}{\tumthesis@theoremnameplural}{Sätze}%
  \providecaptionname{ngerman}{\tumthesis@lemmaname}{Lemma}%
  \providecaptionname{ngerman}{\tumthesis@lemmanameplural}{Lemmata}%
  \providecaptionname{ngerman}{\tumthesis@propositionname}{Proposition}%
  \providecaptionname{ngerman}{\tumthesis@propositionnameplural}{Propositionen}%
  \providecaptionname{ngerman}{\tumthesis@corollaryname}{Korollar}%
  \providecaptionname{ngerman}{\tumthesis@corollarynameplural}{Korollare}%
  \providecaptionname{ngerman}{\tumthesis@conjecturename}{Vermutung}%
  \providecaptionname{ngerman}{\tumthesis@conjecturenameplural}{Vermutungen}%
  \providecaptionname{ngerman}{\tumthesis@remarkname}{Bemerkung}%
  \providecaptionname{ngerman}{\tumthesis@remarknameplural}{Bemerkungen}%
  \providecaptionname{ngerman}{\tumthesis@definitionname}{Definition}%
  \providecaptionname{ngerman}{\tumthesis@definitionnameplural}{Definitionen}%
  \providecaptionname{ngerman}{\tumthesis@problemname}{Problem}%
  \providecaptionname{ngerman}{\tumthesis@problemnameplural}{Probleme}%
  \providecaptionname{ngerman}{\tumthesis@examplename}{Beispiel}%
  \providecaptionname{ngerman}{\tumthesis@examplenameplural}{Beispiele}%
  \providecaptionname{ngerman}{\tumthesis@proofname}{Beweis}%
  \providecaptionname{ngerman}{\tumthesis@proofnameplural}{Beweise}%
  \providecaptionname{ngerman}{\tumthesis@algocfname}{Algorithmus}%
  \providecaptionname{ngerman}{\tumthesis@algocfnameplural}{Algorithmen}%
}
% ______________________________________________________________________________

% ------------------------------------------------------------------------------
% Erstellt eine Titelseite
\renewcommand{\maketitle}{%
  \maketitlepage
}%

% alle Maße nach TUM Styleguide Band 2, soweit dort ersichtlich
\newcommand{\maketitlepage}{%
  \begin{titlepage}%
    % serifenlose Schrift
    \sffamily%
    \begin{tikzpicture}[overlay, remember picture]
      %Mathematik-Logo
      \node[anchor=north west]%
      at ($ (current page.north west) + (+25mm, -15mm) $)%
      {\mathlogo{height=10mm}};%
      %TUM-Logo
      \node[anchor=north east]%
      at ($ (current page.north east) + (-15mm, -15mm) $)%
      {\tumlogo{height=10mm}};%
      % Fakultät und Institut/Lehrstuhl
      \node[anchor = north west, align=left]%
      at ($ (current page.north west) + (+25mm, -40mm) $)%
      {\parbox{170mm}{\Large \@faculty\\\@institute}};%
      % Titel, Untertitel
      \node[anchor = north west, align=left, color=tumblue2] (titlenode)%
      at ($ (current page.north west) + (+25mm, -80mm) $) {%
        \parbox{170mm}{\huge \textbf{\@title}\\ \Large \@subtitle}%
      };%
      % Typ, Autor
      \node[anchor = north west, align=left]%
      at ($ (titlenode.south west) + (0mm, -10mm) $) {%
        \parbox{150mm}{%
          \ifstr{\@subject}{}%
          {\Large \textbf{\@author}}%
          {\Large\textbf{\@subject\xspace\fromname\xspace\@author}}%
        }%
      };%
      \Large%
      \tumthesis@placeTitlepicture
      \node[anchor=south west]%
      at ($ (current page.south west) + (+25mm, +25mm) $)%
      {%
        \begin{tabular}{lp{100mm}}
          \examinername: & \strut\@professor\\[1.5ex]
          \advisorname: & \strut\@advisor\\[1.5ex]
          \submissiondatename: & \strut\@date
        \end{tabular}
      };%
    \end{tikzpicture}
  \end{titlepage}%
}%

\newcommand{\maketitlepageDissertation}{
\begin{titlepage}
%    \sffamily%
    \begin{tikzpicture}[overlay, remember picture, y=1mm, yscale=-1]
		% Measurements		
		\def\marginLeft{25mm}
		\def\marginRight{35mm}
		\def\marginTop{25mm}
		\def\titleOverflow{20mm}
		\pgfmathsetmacro{\width}{210mm-\marginLeft-\marginRight}

		\tikzstyle{every node}=[inner sep=0pt]

		% Faculty
    	\node[anchor=north west,align=flush center,text width=\width] (university) at ($(current page.north west)+(\marginLeft,\marginTop)$) {\Large Technische Universität München};
    	\node[align=flush center,text width=\width] (faculty) at ($(university)+(0,10mm)$) {\@faculty};
    	
    	% Title and author
    	\node[align=flush center,text width=\width+\titleOverflow] (title) at ($(faculty)+(0,40mm)$) {\LARGE\textbf{\@title}\par};
		\node[align=flush center,text width=\width] (author) at ($(title)+(0,20mm)$) {\Large\@author\par};

		% Declaration
		\node[align=flush left,text width=\width,anchor=north] (typeIntro) at ($(author)+(0,40mm)$) {Vollständiger Abdruck der von der \@faculty{} der Technischen Universität München zur Erlangung des akademischen Grades eines\vphantom{Jg}\par};
		\node[anchor=north] (type) at ($(typeIntro.south)+(0,1.5*\baselineskip)$) {Doktors der Naturwissenschaften (Dr.\,rer.\,nat.)\vphantom{Jg}\par};
		\node[align=flush left,text width=\width,anchor=north] (typeOutro) at ($(type.south)+(0,1.5*\baselineskip)$) {eingereichten Dissertation.\vphantom{Jg}\par};
		
		% Examiners
		\node[anchor=north west] (chairmanLabel) at ($(typeOutro.south west)+(25mm,20mm)$) {Vorsitzender:};
		\begin{scope}[yscale=1.5]
			\node[anchor=base west] (examinersLabel) at ($(chairmanLabel.base west)+(0,\baselineskip)$) {Prüfer der Dissertation:};
			\node[anchor=base west] (chairman) at ($(chairmanLabel.base -| examinersLabel.east)+(10mm,0)$) {\@chairman};
			\def\i{1}
			\foreach \name in \@examiners {
				\node[anchor=base east] at ($(chairman.base west)+(-2mm,\i*\baselineskip)$) {\pgfmathprintnumber[int trunc]{\i}.};
				\node[anchor=base west] (examiner\i) at ($(chairman.base west)+(0,\i*\baselineskip)$) {\name};
				\pgfmathsetmacro\i{\i+1}
				\xdef\i{\i}
			}
			\node[anchor=base west] (lastExaminer) at ($(chairman.base west)+(0,{(\i-1)*\baselineskip})$) {\vphantom{Jg}};
		\end{scope}
		
		% Date
		\coordinate (helper) at ($(lastExaminer)+(0,20mm)$);
		\node[align=flush left,text width=\width,anchor=north] (date) at (helper -| typeOutro) {Die Dissertation wurde am \@date{} bei der Technischen
	 Universität München eingereicht und durch die \@faculty{} am \@acceptanceDate{} angenommen.};
    \end{tikzpicture}
\end{titlepage}
}

\newcommand{\makedeclaration}{%
%\cleardoublepage
  \begin{titlepage}
    \sffamily\Large%
    \begin{tikzpicture}[overlay, remember picture]
      \node[anchor=south west] (declaration place)%
      at ($ (current page.south west) + (25mm, +25mm) $)%
      {\strut\@place\placedateseparator\xspace\@date};%
      \node[anchor=south west, text width=150mm] (declaration text)%
      at ($ (declaration place.north west) + (+0mm, +25mm) $)%
      {\declarationtext};%      
      \draw (declaration place.south east) + (10mm,0mm) --
      node[below]{\normalsize \@author} (intersection of
      declaration place.south--declaration place.south east and declaration
      text.east--declaration text.south east);
    \end{tikzpicture}
  \end{titlepage}
}%
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
% Include custom preamble to load further packages and override settings of this class
\include{preamble}
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
% hyperref settings for PDF files
\RequirePackage[%
    allbordercolors=tumblue1,%
    allcolors=tumblue1,%
    breaklinks=true, %% allow links to break across lines
    colorlinks=false, %switch off colouring
    pdfpagelabels=true,%% set PDF page labels (i.e. for Acrobat Reader), cf http://www.tex.ac.uk/cgi-bin/texfaq2html?label=pdfpagelabels (needed for index to work)
    plainpages=false,%% Make page anchors use formatted form of page number, cf http://www.tex.ac.uk/cgi-bin/texfaq2html?label=pdfpagelabels (needed for index to work)
    hypertexnames=true,%% use guessable names for links (needed for index to work)
    bookmarksopen=false,%
    bookmarksnumbered=false,%
    hyperfootnotes=false% incompatible with package footmisc
]%
{hyperref}%
% ------------------------------------------------------------------------------

% ------------------------------------------------------------------------------
% References (must be loaded last, but before theorem defintions, as we need
% some cleveref commands there!)
\RequirePackage[ngerman,english,capitalise]{cleveref}
% ------------------------------------------------------------------------------

% ==============================================================================
% Mathematische Definition und Makros
% ==============================================================================

% ------------------------------------------------------------------------------
% Theorem-Umgebungen
\RequirePackage{latexsym} %für die Beweis-Box
\newtheoremstyle{titlebreak}%
  {\item[\rlap{\vbox{\hbox{\hskip\labelsep \theorem@headerfont
          ##1\ ##2\theorem@separator}\hbox{\strut}}}]}%
  {\item[\rlap{\vbox{\hbox{\hskip\labelsep \theorem@headerfont
          ##1\ ##2\ (##3)\theorem@separator}\hbox{\strut}}}]}

\theoremnumbering{arabic}%
\ifthenelse{\equal{\tumthesis@theoremtitle}{break}}{
    \theoremstyle{titlebreak}%
}{%
    \ifthenelse{\equal{\tumthesis@theoremtitle}{nobreak}}{
        % Nothing to do
    }{%
        % Wrong option
        \ClassError{tumthesis}{The value assigned to option theoremtitle is invalid. Please use either "break" or "nobreak".}{\ documentclass[theoremtitle=nobreak]{tumthesis} would be ok, for example.}
    }%
}%
\theorembodyfont{\itshape}%
\theoremheaderfont{\bfseries}%
\theoremseparator{}%
\newtheorem{theorem}{\tumthesis@theoremname}[chapter]%
\crefname{theorem}{\tumthesis@theoremname}{\tumthesis@theoremnameplural}
\Crefname{theorem}{\tumthesis@theoremname}{\tumthesis@theoremnameplural}
\newtheorem{satz}[theorem]{\tumthesis@theoremname}
\crefname{satz}{\tumthesis@theoremname}{\tumthesis@theoremnameplural}
\Crefname{satz}{\tumthesis@theoremname}{\tumthesis@theoremnameplural}
\newtheorem{proposition}[theorem]{\tumthesis@propositionname}
\crefname{proposition}{\tumthesis@propositionname}{\tumthesis@propositionnameplural}
\Crefname{proposition}{\tumthesis@propositionname}{\tumthesis@propositionnameplural}
\newtheorem{lemma}[theorem]{\tumthesis@lemmaname}%
\crefname{lemma}{\tumthesis@lemmaname}{\tumthesis@lemmanameplural}
\Crefname{lemma}{\tumthesis@lemmaname}{\tumthesis@lemmanameplural}
\newtheorem{corollary}[theorem]{\tumthesis@corollaryname}
\crefname{corollary}{\tumthesis@corollaryname}{\tumthesis@corollarynameplural}
\Crefname{corollary}{\tumthesis@corollaryname}{\tumthesis@corollarynameplural}
\newtheorem{korollar}[theorem]{\tumthesis@corollaryname}
\crefname{korollar}{\tumthesis@corollaryname}{\tumthesis@corollarynameplural}
\Crefname{korollar}{\tumthesis@corollaryname}{\tumthesis@corollarynameplural}
\newtheorem{conjecture}[theorem]{\tumthesis@conjecturename}
\crefname{conjecture}{\tumthesis@conjecturename}{\tumthesis@conjecturenameplural}
\Crefname{conjecture}{\tumthesis@conjecturename}{\tumthesis@conjecturenameplural}
\newtheorem{vermutung}[theorem]{\tumthesis@conjecturename}
\crefname{vermutung}{\tumthesis@conjecturename}{\tumthesis@conjecturenameplural}
\Crefname{vermutung}{\tumthesis@conjecturename}{\tumthesis@conjecturenameplural}

\theorembodyfont{\upshape}%
\newtheorem{remark}[theorem]{\tumthesis@remarkname}%
\crefname{remark}{\tumthesis@remarkname}{\tumthesis@remarknameplural}
\Crefname{remark}{\tumthesis@remarkname}{\tumthesis@remarknameplural}
\newtheorem{bemerkung}[theorem]{\tumthesis@remarkname}%
\crefname{bemerkung}{\tumthesis@remarkname}{\tumthesis@remarknameplural}
\Crefname{bemerkung}{\tumthesis@remarkname}{\tumthesis@remarknameplural}
\newtheorem{definition}[theorem]{\tumthesis@definitionname}%
\crefname{definition}{\tumthesis@definitionname}{\tumthesis@definitionnameplural}
\Crefname{definition}{\tumthesis@definitionname}{\tumthesis@definitionnameplural}
\newtheorem{problem}[theorem]{\tumthesis@problemname}%
\crefname{problem}{\tumthesis@problemname}{\tumthesis@problemnameplural}
\Crefname{problem}{\tumthesis@problemname}{\tumthesis@problemnameplural}

\theoremstyle{break}
\newtheorem{example}[theorem]{\tumthesis@examplename}%
\crefname{example}{\tumthesis@examplename}{\tumthesis@examplenameplural}
\Crefname{example}{\tumthesis@examplename}{\tumthesis@examplenameplural}
\newtheorem{beispiel}[theorem]{\tumthesis@examplename}%
\crefname{beispiel}{\tumthesis@examplename}{\tumthesis@examplenameplural}
\Crefname{beispiel}{\tumthesis@examplename}{\tumthesis@examplenameplural}

\theoremstyle{nonumberplain}%
\theoremheaderfont{\bfseries}%
\theorembodyfont{\normalfont}%
\theoremseparator{.}
\theoremsymbol{\ensuremath{\Box}}%
\newtheorem{proof}{\tumthesis@proofname}%
\crefname{proof}{\tumthesis@proofname}{\tumthesis@proofnameplural}
\Crefname{proof}{\tumthesis@proofname}{\tumthesis@proofnameplural}
\newtheorem{beweis}{\tumthesis@proofname}%
\crefname{beweis}{\tumthesis@proofname}{\tumthesis@proofnameplural}
\Crefname{beweis}{\tumthesis@proofname}{\tumthesis@proofnameplural}

\crefname{algocf}{\tumthesis@algocfname}{\tumthesis@algocfnameplural}
\Crefname{algocf}{\tumthesis@algocfname}{\tumthesis@algocfnameplural}
