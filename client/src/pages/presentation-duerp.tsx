import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Shield, AlertTriangle, Gavel, Euro,
  GraduationCap, HeartPulse, CheckCircle2, Users, FileText, Building2,
  Scale, ShieldAlert, Ban, Clock, BookOpen, ArrowRight, Presentation,
  Banknote, Award, ExternalLink, Siren, UserX, FileWarning, HandCoins,
  Phone, Mail, MapPin, Briefcase,
} from "lucide-react";
import heroImg from "@/assets/images/duerp-hero.png";
import risksImg from "@/assets/images/duerp-risks.png";
import sanctionsImg from "@/assets/images/duerp-sanctions.png";
import formationImg from "@/assets/images/duerp-formation.png";
import financementImg from "@/assets/images/duerp-financement.png";
import avantagesImg from "@/assets/images/duerp-avantages.png";
import { SATIS_CONSEILS } from "@shared/schema";

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  content: () => JSX.Element;
}

function SlideCounter({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? "w-6 bg-primary" : "w-1.5 bg-primary/20"
          }`}
        />
      ))}
    </div>
  );
}

export default function PresentationDUERP() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: "intro",
      title: "Le Document Unique d'Evaluation des Risques Professionnels",
      subtitle: "DUERP - Votre obligation, notre expertise",
      content: () => (
        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src={heroImg} alt="DUERP - Evaluation des risques professionnels" className="w-full h-48 md:h-64 object-cover" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold text-sm">Obligation legale</p>
                <p className="text-xs text-muted-foreground mt-1">Depuis le decret du 5 novembre 2001</p>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold text-sm">Tous les employeurs</p>
                <p className="text-xs text-muted-foreground mt-1">Des le 1er salarie, sans exception</p>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold text-sm">Document unique</p>
                <p className="text-xs text-muted-foreground mt-1">Mis a jour au minimum annuellement</p>
              </CardContent>
            </Card>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              Le <strong>DUERP</strong> est le document dans lequel l'employeur transcrit les resultats
              de l'evaluation des risques pour la sante et la securite de ses salaries.
              Il constitue le <strong>point de depart de la demarche de prevention</strong> dans l'entreprise,
              conformement aux <strong>articles R.4121-1 et suivants du Code du travail</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" /> Norme INRS ED 840
            </Badge>
            <Badge variant="outline" className="text-xs">
              <FileText className="w-3 h-3 mr-1" /> Methodologie OiRA
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Scale className="w-3 h-3 mr-1" /> Code du travail
            </Badge>
          </div>
        </div>
      ),
    },
    {
      id: "quest-ce-que",
      title: "Qu'est-ce que le DUERP ?",
      subtitle: "Un outil essentiel pour la securite au travail",
      content: () => (
        <div className="space-y-5">
          <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Definition
            </h3>
            <p className="text-sm leading-relaxed">
              Le Document Unique d'Evaluation des Risques Professionnels (DUERP)
              est un <strong>inventaire exhaustif des risques</strong> auxquels sont exposes
              les salaries dans chaque unite de travail de l'entreprise. Il est
              obligatoire pour <strong>tout employeur des le premier salarie</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Ce que contient le DUERP
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  "Identification des dangers dans chaque unite de travail",
                  "Analyse des conditions d'exposition des salaries",
                  "Evaluation et hierarchisation des risques (gravite, frequence, maitrise)",
                  "Inventaire des mesures de prevention existantes",
                  "Programme annuel de prevention (entreprises > 50 salaries)",
                  "Liste des actions de prevention (entreprises < 50 salaries)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Quand le mettre a jour ?
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  "Au minimum une fois par an (obligatoire)",
                  "Lors de tout amenagement modifiant les conditions de travail",
                  "Lorsqu'une information supplementaire sur un risque est recueillie",
                  "Apres chaque accident du travail ou maladie professionnelle",
                  "En cas de changement de locaux ou d'equipements",
                  "Lors de l'introduction de nouveaux produits ou procedes",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-orange-600 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-amber-800 dark:text-amber-400">Conservation obligatoire</p>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                  Depuis la loi du 2 aout 2021, le DUERP et ses mises a jour doivent etre conserves
                  pendant <strong>40 ans minimum</strong> et mis a disposition des travailleurs, anciens
                  travailleurs et de toute personne ou instance pouvant justifier d'un interet a y acceder.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "risques",
      title: "Les 20 familles de risques professionnels",
      subtitle: "Referentiel INRS ED 840 - Evaluation exhaustive",
      content: () => (
        <div className="space-y-5">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src={risksImg} alt="Les risques professionnels" className="w-full h-40 md:h-56 object-cover" />
          </div>
          <p className="text-sm text-muted-foreground">
            L'INRS (Institut National de Recherche et de Securite) identifie <strong>20 familles de risques</strong> dans
            son guide ED 840, couvrant l'ensemble des dangers auxquels les salaries peuvent etre exposes.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { name: "Risques de chutes de hauteur", icon: AlertTriangle, color: "text-red-600" },
              { name: "Risques de chutes de plain-pied", icon: AlertTriangle, color: "text-red-500" },
              { name: "Risques lies aux manutentions manuelles", icon: Users, color: "text-orange-600" },
              { name: "Risques lies aux postures", icon: Users, color: "text-orange-500" },
              { name: "Risques chimiques", icon: ShieldAlert, color: "text-purple-600" },
              { name: "Risques biologiques", icon: HeartPulse, color: "text-pink-600" },
              { name: "Risques lies au bruit", icon: Siren, color: "text-blue-600" },
              { name: "Risques electriques", icon: ShieldAlert, color: "text-yellow-600" },
              { name: "Risques d'incendie/explosion", icon: ShieldAlert, color: "text-red-700" },
              { name: "Risques lies aux machines", icon: Ban, color: "text-gray-700" },
              { name: "Risques lies aux vehicules", icon: AlertTriangle, color: "text-blue-700" },
              { name: "Risques psychosociaux (RPS)", icon: HeartPulse, color: "text-indigo-600" },
              { name: "Risques lies aux ambiances thermiques", icon: AlertTriangle, color: "text-orange-700" },
              { name: "Risques lies aux vibrations", icon: Siren, color: "text-teal-600" },
              { name: "Risques lies aux rayonnements", icon: ShieldAlert, color: "text-violet-600" },
              { name: "Risques lies au travail isole", icon: UserX, color: "text-slate-600" },
              { name: "Risques lies au travail en hauteur", icon: AlertTriangle, color: "text-red-800" },
              { name: "Risques routiers", icon: AlertTriangle, color: "text-amber-700" },
              { name: "Risques lies aux agents CMR", icon: ShieldAlert, color: "text-rose-700" },
              { name: "Autres risques specifiques", icon: FileWarning, color: "text-gray-600" },
            ].map((risk, i) => (
              <div key={i} className="flex items-start gap-1.5 p-2 rounded-md bg-muted/40 border text-xs">
                <risk.icon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${risk.color}`} />
                <span className="leading-tight">{risk.name}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            <a
              href="https://www.inrs.fr/media.html?refINRS=ED%20840"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Source : INRS ED 840 - Evaluation des risques professionnels
            </a>
          </div>
        </div>
      ),
    },
    {
      id: "dangers",
      title: "Dangers pour l'employeur et les salaries",
      subtitle: "Pourquoi le DUERP est indispensable",
      content: () => (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-red-700" />
                  </div>
                  <h3 className="font-bold text-sm text-red-800 dark:text-red-400">Dangers pour l'employeur</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    "Responsabilite penale personnelle du dirigeant",
                    "Faute inexcusable de l'employeur reconnue par les tribunaux",
                    "Majoration des cotisations AT/MP par la CPAM",
                    "Mise en demeure et fermeture administrative par l'inspection du travail",
                    "Perte de marches publics (critere SST obligatoire)",
                    "Atteinte a l'image et reputation de l'entreprise",
                    "Contentieux prudhommal (prise d'acte, resiliation judiciaire)",
                    "Interdiction de soumissionner aux appels d'offres publics",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Ban className="w-3 h-3 text-red-600 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-700" />
                  </div>
                  <h3 className="font-bold text-sm text-orange-800 dark:text-orange-400">Dangers pour les salaries</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    "Exposition a des risques non identifies et non maitrises",
                    "Accidents du travail evitables (chutes, brulures, TMS...)",
                    "Maladies professionnelles non diagnostiquees",
                    "Troubles musculosquelettiques (1ere cause d'arret maladie)",
                    "Risques psychosociaux : stress, burn-out, harcelement",
                    "Exposition a des agents chimiques dangereux (CMR)",
                    "Perte d'audition, troubles visuels, pathologies respiratoires",
                    "Absence de formation securite adaptee au poste",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-600 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Scale className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Obligation de resultat, pas seulement de moyens</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    L'employeur est tenu a une <strong>obligation de securite de resultat</strong> envers ses salaries
                    (Cass. soc., 28 fevrier 2002, arrets "Amiante"). Le simple fait de ne pas avoir
                    identifie un risque engage sa responsabilite, meme en l'absence d'accident.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "sanctions",
      title: "Sanctions encourues par le dirigeant",
      subtitle: "Responsabilite penale et civile",
      content: () => (
        <div className="space-y-5">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src={sanctionsImg} alt="Sanctions et responsabilite du dirigeant" className="w-full h-40 md:h-52 object-cover" />
          </div>
          <div className="space-y-3">
            {[
              {
                title: "Absence de DUERP",
                article: "Art. R. 4741-1 Code du travail",
                amende: "1 500 EUR par unite de travail",
                recidive: "3 000 EUR en cas de recidive",
                icon: FileWarning,
                severity: "bg-amber-100 dark:bg-amber-900/30 border-amber-300",
              },
              {
                title: "Mise en danger de la vie d'autrui",
                article: "Art. 223-1 Code penal",
                amende: "15 000 EUR d'amende",
                recidive: "1 an d'emprisonnement",
                icon: ShieldAlert,
                severity: "bg-red-50 dark:bg-red-900/20 border-red-300",
              },
              {
                title: "Homicide involontaire",
                article: "Art. 221-6 Code penal",
                amende: "45 000 EUR d'amende",
                recidive: "3 ans d'emprisonnement",
                icon: Gavel,
                severity: "bg-red-100 dark:bg-red-900/30 border-red-400",
              },
              {
                title: "Blessures involontaires (ITT > 3 mois)",
                article: "Art. 222-19 Code penal",
                amende: "45 000 EUR d'amende",
                recidive: "3 ans d'emprisonnement",
                icon: UserX,
                severity: "bg-red-100 dark:bg-red-900/30 border-red-400",
              },
              {
                title: "Faute inexcusable de l'employeur",
                article: "Art. L.452-1 Code de la Securite sociale",
                amende: "Majoration de la rente + reparation integrale des prejudices",
                recidive: "Cotisations AT/MP majorees",
                icon: Scale,
                severity: "bg-purple-50 dark:bg-purple-900/20 border-purple-300",
              },
            ].map((s, i) => (
              <div key={i} className={`rounded-lg border p-3 ${s.severity}`}>
                <div className="flex items-start gap-3">
                  <s.icon className="w-5 h-5 text-red-700 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm">{s.title}</p>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">{s.article}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs">
                      <span className="flex items-center gap-1">
                        <Euro className="w-3 h-3" /> {s.amende}
                      </span>
                      <span className="flex items-center gap-1 text-red-700 dark:text-red-400 font-medium">
                        <Siren className="w-3 h-3" /> {s.recidive}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "avantages",
      title: "Les avantages concrets du DUERP",
      subtitle: "Un investissement rentable pour votre entreprise",
      content: () => (
        <div className="space-y-5">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src={avantagesImg} alt="Avantages du DUERP" className="w-full h-40 md:h-52 object-cover" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                icon: Shield,
                title: "Protection juridique",
                desc: "Preuve de la diligence de l'employeur en cas de controle ou de contentieux. Le DUERP constitue une piece maitresse en cas de litige.",
                color: "text-blue-600",
              },
              {
                icon: Euro,
                title: "Reduction des couts",
                desc: "Baisse du taux de cotisation AT/MP, reduction de l'absenteisme, diminution des arrets maladie et des couts lies aux remplacements.",
                color: "text-green-600",
              },
              {
                icon: Users,
                title: "Amelioration du climat social",
                desc: "Implication des salaries dans la prevention, renforcement de la confiance, dialogue social constructif et motivation des equipes.",
                color: "text-indigo-600",
              },
              {
                icon: Award,
                title: "Image de marque",
                desc: "Valorisation de l'engagement RSE, attractivite employeur, conformite aux exigences des donneurs d'ordre et marches publics.",
                color: "text-amber-600",
              },
              {
                icon: HeartPulse,
                title: "Sante des salaries",
                desc: "Prevention des TMS, des RPS et des maladies professionnelles. Amelioration des conditions de travail et bien-etre au travail.",
                color: "text-pink-600",
              },
              {
                icon: CheckCircle2,
                title: "Conformite reglementaire",
                desc: "Respect des obligations legales, sereinite face aux controles de l'inspection du travail et des organismes de prevoyance.",
                color: "text-teal-600",
              },
            ].map((item, i) => (
              <Card key={i} className="border">
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "formation",
      title: "Le DUERP ouvre des droits a la formation",
      subtitle: "Securite au travail et developpement des competences",
      content: () => (
        <div className="space-y-5">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src={formationImg} alt="Formation et droits ouverts" className="w-full h-40 md:h-52 object-cover" />
          </div>
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Les formations liees au DUERP
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le DUERP constitue la base pour identifier les <strong>besoins en formation securite</strong> de
              vos salaries. Il ouvre des droits concrets et permet d'acceder a des financements specifiques.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Formation securite obligatoire a l'embauche",
                desc: "Art. L.4141-2 du Code du travail : formation pratique et appropriee en matiere de securite, adaptee au poste de travail et aux risques identifies dans le DUERP.",
                icon: Users,
              },
              {
                title: "Formation des membres du CSE/CSSCT",
                desc: "Les representants du personnel beneficient d'une formation en sante, securite et conditions de travail, financee par l'employeur (5 jours pour un 1er mandat).",
                icon: BookOpen,
              },
              {
                title: "Formation SST (Sauveteur Secouriste du Travail)",
                desc: "Formation initiale de 14h et recyclage tous les 2 ans. Le nombre de SST est determine en fonction des risques identifies dans le DUERP.",
                icon: HeartPulse,
              },
              {
                title: "Formation incendie et evacuation",
                desc: "Exercices d'evacuation obligatoires tous les 6 mois, formation a la manipulation des extincteurs et aux procedures d'urgence.",
                icon: ShieldAlert,
              },
              {
                title: "Formation aux risques specifiques",
                desc: "Risque chimique (CMR), risque electrique (habilitation), travail en hauteur, CACES, amiante... selon les risques identifies dans votre DUERP.",
                icon: AlertTriangle,
              },
              {
                title: "Formation gestes et postures / TMS",
                desc: "Prevention des troubles musculosquelettiques, formation PRAP (Prevention des Risques lies a l'Activite Physique), amenagement ergonomique des postes.",
                icon: Award,
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "financement",
      title: "Financement par la Caisse d'Assurance Maladie",
      subtitle: "Des enveloppes dediees pour la prevention",
      content: () => (
        <div className="space-y-5">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src={financementImg} alt="Financement CPAM" className="w-full h-40 md:h-52 object-cover" />
          </div>
          <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <HandCoins className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">La CPAM/CARSAT finance vos actions de prevention</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    L'Assurance Maladie - Risques professionnels propose des <strong>aides financieres</strong> aux
                    entreprises pour les accompagner dans leur demarche de prevention. Le DUERP est le
                    <strong> prealable indispensable</strong> pour beneficier de ces aides.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-sm">Subventions Prevention TPE</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pour les entreprises de <strong>moins de 50 salaries</strong>. Aide financiere pouvant
                  aller jusqu'a <strong>25 000 EUR</strong> pour financer des equipements, des formations
                  ou des diagnostics de prevention.
                </p>
                <Badge variant="outline" className="text-[10px]">Entreprises 1-49 salaries</Badge>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-sm">Contrats de prevention</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pour les entreprises de <strong>moins de 200 salaries</strong>. Convention avec la CARSAT
                  pour financer un programme de prevention pluriannuel, avec un engagement de resultats.
                </p>
                <Badge variant="outline" className="text-[10px]">Entreprises 1-199 salaries</Badge>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm">Reduction du taux AT/MP</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Une demarche de prevention efficace entraine une <strong>baisse de la sinistralite</strong>,
                  ce qui reduit directement le taux de cotisation AT/MP de l'entreprise.
                  Economie pouvant atteindre <strong>plusieurs milliers d'euros par an</strong>.
                </p>
                <Badge variant="outline" className="text-[10px]">Toutes entreprises</Badge>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-sm">Financement formations securite</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  L'OPCO de l'entreprise et la CARSAT peuvent <strong>cofinancer les formations</strong> identifiees
                  dans le DUERP : SST, habilitations electriques, CACES, risque chimique, gestes et postures...
                </p>
                <Badge variant="outline" className="text-[10px]">Via OPCO + CARSAT</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            <a
              href="https://www.ameli.fr/entreprise/sante-travail/aides-financieres"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              En savoir plus : ameli.fr - Aides financieres pour la prevention
            </a>
          </div>
        </div>
      ),
    },
    {
      id: "satis",
      title: "Satis Conseils, votre partenaire DUERP",
      subtitle: "Expertise, conformite et accompagnement sur mesure",
      content: () => (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/15">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{SATIS_CONSEILS.name}</h3>
                <p className="text-xs text-muted-foreground">{SATIS_CONSEILS.forme} - Conseil en securite au travail</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{SATIS_CONSEILS.address}, {SATIS_CONSEILS.postalCode} {SATIS_CONSEILS.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                <span>SIRET : {SATIS_CONSEILS.siret}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>RCS Paris - NAF {SATIS_CONSEILS.naf}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-sm">Etablissement du DUERP</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {[
                    "Audit complet de votre entreprise",
                    "Identification de tous les risques (20 familles INRS ED 840)",
                    "Questionnaire sectoriel OiRA (46 secteurs disponibles)",
                    "Cotation des risques (gravite x frequence x maitrise)",
                    "Plan d'action de prevention priorise",
                    "Rapport conforme en 4 documents OiRA",
                    "Accompagnement a la mise en oeuvre",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t">
                  <p className="text-lg font-bold text-primary">900 EUR HT</p>
                  <p className="text-[10px] text-muted-foreground">soit 1 080 EUR TTC (TVA 20%)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-sm">Mise a jour annuelle du DUERP</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {[
                    "Revue des risques existants",
                    "Integration des nouveaux risques identifies",
                    "Mise a jour du plan d'action",
                    "Suivi des mesures de prevention mises en place",
                    "Actualisation de la cotation des risques",
                    "Nouvelle version conforme du document",
                    "Archivage de la version precedente (40 ans)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t">
                  <p className="text-lg font-bold text-primary">200 EUR HT</p>
                  <p className="text-[10px] text-muted-foreground">soit 240 EUR TTC (TVA 20%)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-5 text-center space-y-3">
              <h3 className="font-bold text-lg">Protegez votre entreprise des maintenant</h3>
              <p className="text-sm opacity-90">
                Contactez-nous pour un devis personnalise et un accompagnement sur mesure
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  Demandez un rendez-vous
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  contact@satis-conseils.fr
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  const goNext = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  const goPrev = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Presentation className="w-6 h-6 text-primary" />
        <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="text-presentation-title">
          Presentation commerciale DUERP
        </h1>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 md:p-6 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-bold" data-testid="text-slide-title">
                {slides[currentSlide].title}
              </h2>
              {slides[currentSlide].subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{slides[currentSlide].subtitle}</p>
              )}
            </div>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {currentSlide + 1} / {slides.length}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 md:p-6">
          {slides[currentSlide].content()}
        </CardContent>

        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={currentSlide === 0}
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Precedent
          </Button>

          <SlideCounter current={currentSlide} total={slides.length} />

          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={currentSlide === slides.length - 1}
            data-testid="button-next-slide"
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {slides.map((slide, i) => (
          <Button
            key={slide.id}
            variant={i === currentSlide ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setCurrentSlide(i)}
            data-testid={`button-slide-${slide.id}`}
          >
            {i + 1}. {slide.title.length > 30 ? slide.title.substring(0, 30) + "..." : slide.title}
          </Button>
        ))}
      </div>
    </div>
  );
}
