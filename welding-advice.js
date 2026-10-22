import {WELDING_RULES} from './welding.js';

// Editorial interview prompts. These are not additional manufacturer claims.
// Documented benefits below are copied only from the selected product's data.
const angles={
  I2013:{focus:'la finition attendue et le travail réalisé après soudage',question:'Quelle finition devez-vous obtenir, et quelles opérations réalisez-vous après soudage ?'},
  I2531:{focus:'l’aspect attendu du cordon et les reprises de finition',question:'Quel aspect est exigé sur vos pièces inox, et quelles reprises faites-vous aujourd’hui ?'},
  I2561:{focus:'le temps de soudage, les reprises et les interruptions',question:'Où perdez-vous le plus de temps : pendant le soudage, dans les reprises ou lors des interruptions ?'},
  I2506:{focus:'les exigences de l’assemblage et les écarts de qualité rencontrés',question:'Quelles exigences l’assemblage doit-il respecter, et quels défauts entraînent aujourd’hui des reprises ?'},
  I2541:{focus:'la qualité de la pièce finie et le temps de reprise',question:'Sur vos tôles fines ou revêtues, quelles reprises sont nécessaires avant de livrer une pièce conforme ?'},
  I2576:{focus:'les exigences de vos assemblages d’armatures',question:'Quel procédé et quel mode opératoire utilisez-vous pour ces armatures ou treillis ?'},
  I2577:{focus:'le résultat attendu en MAG et votre consommation réelle',question:'Que souhaitez-vous conserver ou améliorer dans votre soudage MAG des aciers carbone ?'},
  I2539:{focus:'l’application MAG à couvrir et les exigences de votre mode opératoire',question:'Quel gaz et quel mode opératoire utilisez-vous actuellement sur ces aciers ?'},
  I2580:{focus:'le rôle du gaz dans votre application et les critères de qualité attendus',question:'S’agit-il de MIG, de TIG ou d’un gaz annulaire plasma, et sur quelle nuance ?'},
  I2594:{focus:'le procédé employé et le résultat attendu sur la pièce',question:'Pour quel métal et quel procédé envisagez-vous cette référence, et quel résultat recherchez-vous ?'},
  I2610:{focus:'la nuance exacte et les critères d’acceptation de l’assemblage',question:'Quelle nuance inox figure sur le plan et quels contrôles sont exigés pour la soudure ?'},
  I2598:{focus:'la nuance nickel, le procédé et les critères de qualité',question:'S’agit-il d’assemblage ou de rechargement, avec quelle nuance et quel métal d’apport ?'},
  I2605:{focus:'le mode de travail et les critères de qualité de la pièce',question:'Quel métal soudez-vous, avec quel procédé et en mode manuel ou automatique ?'},
  I2642:{focus:'le travail de préparation et de finition de vos assemblages',question:'Quel temps consacrez-vous à la préparation et à la finition de vos pièces inox ?'},
  I2631:{focus:'la nuance inox, l’épaisseur et les exigences de l’assemblage',question:'Quelle nuance, quelle épaisseur et quels critères d’acceptation faut-il prendre en compte ?'},
  I2641:{focus:'la nuance inox à assembler et le résultat à obtenir',question:'La nuance est-elle identifiée dans le mode opératoire, et quels contrôles sont prévus ?'},
  I2651:{focus:'votre besoin en MAG et les résultats mesurables dans l’atelier',question:'Quel problème précis ou quelle attente justifie d’examiner une autre référence pour ce MAG ?'},
  I2612:{focus:'la nuance exacte et les exigences du soudage inox',question:'Quelle nuance inox et quel procédé sont indiqués dans votre mode opératoire ?'},
  I2512:{focus:'l’aspect du cordon et les opérations après soudage',question:'Quel aspect et quelles opérations de finition sont exigés pour cette application ?'},
  I2552:{focus:'le rôle du gaz et les conditions de l’application',question:'Le besoin concerne-t-il le soudage ou la protection envers, sur quelle nuance et avec quel mode opératoire ?'},
  I2521:{focus:'le fonctionnement du poste automatique et les critères de qualité',question:'Quel procédé automatique et quelle nuance sont prévus, et quel résultat souhaitez-vous améliorer ?'}
};

const needQuestions={
  cadence:'Sur une pièce représentative, où se concentre le temps : soudage, reprises ou interruptions ?',
  finition:'Quelle finition est exigée, et quelles reprises vous prennent le plus de temps ?',
  fin:'Quelle épaisseur travaillez-vous et quel défaut ou résultat souhaitez-vous améliorer ?',
  epais:'Quelles épaisseurs, exigences d’assemblage et contrôles faut-il prendre en compte ?',
  automatique:'Quel point limite la production sur la ligne : temps de cycle, reprises ou interruptions ?'
};

const confirmations={
  'fil-plein':'Le client a déclaré utiliser un fil plein.',
  'fil-fourre-inox':'Le client a déclaré utiliser un fil fourré inox adapté.',
  'pulse-fil-plein':'Le client a déclaré utiliser le MAG pulsé avec fil plein.',
  automatique:'Le client a déclaré travailler en mode automatique.'
};

function guidedPitch(product,context,match,angle){
  const name=product.name,code=product.welding?.manufacturerCode;
  const hasBenefit=product.welding?.benefits?.length>0;
  let opening=`${name} est une piste documentée pour l’application indiquée`;
  let next=`Regardons ${angle.focus} pour définir ce que la proposition doit apporter à votre atelier`;
  if(code==='I2013'){
    if(context.process==='envers'){
      opening=`${name} est une piste documentée pour protéger la face opposée à la soudure`;
      next='Vérifions les exigences de la protection envers et le mode opératoire de votre assemblage';
    }else if(context.process==='mig'){
      opening=`${name} est cité pour le MIG de l’aluminium et du cuivre`;
      next='Partons de la finition exigée et des opérations réalisées sur vos pièces pour vérifier l’intérêt dans votre atelier';
    }else{
      opening=`${name} est cité pour le TIG et le plasma${hasBenefit?' ; Air Liquide met en avant sa faible teneur en impuretés':''}`;
      next='Comparons la finition attendue et les opérations après soudage sur vos pièces pour vérifier l’intérêt dans votre atelier';
    }
  }else if(code==='I2531'){
    opening=`${name} est cité pour le MAG des inox${hasBenefit?', avec peu de projections et moins de finition annoncés par Air Liquide':''}`;
    next='Comparons l’aspect demandé et vos reprises réelles pour vérifier l’intérêt sur vos pièces';
  }else if(code==='I2561'){
    opening=`${name} est une piste pour ${match.condition?'le MAG des aciers carbone':'votre MAG acier avec fil plein'}`;
    next='Comparons le temps total, les reprises et la consommation sur vos pièces pour vérifier l’intérêt dans votre atelier';
  }else if(code==='I2506'){
    if(context.material==='carbone'){
      if(context.need==='fin'){
        opening=`${name} est cité pour le MAG des tôles fines en court-circuit`;
        next='Faisons confirmer ce régime et les exigences de vos pièces avant de comparer la qualité et les reprises';
      }else{
        opening=`${name} est cité pour le MAG des aciers carbone, notamment les pièces épaisses ou sollicitées`;
        next=hasBenefit?'Air Liquide met en avant la pénétration et la compacité ; vérifions ces points sur votre assemblage':'Comparons la conformité et les reprises selon les exigences de votre assemblage';
      }
    }else{
      opening=`${name} est une piste publiée pour l’inox${match.condition?'':' avec fil fourré inox'}`;
      next='Faisons confirmer le fil adapté et les exigences de l’assemblage avant de préparer la proposition';
    }
  }
  const reservations=[];
  if(match.condition){
    const labels={
      'fil-plein':'le fil plein à confirmer',
      'fil-fourre-inox':'le fil fourré inox à confirmer',
      'pulse-fil-plein':'le MAG pulsé et le fil plein à confirmer',
      automatique:'le mode automatique à confirmer',
      'procede-armatures':'le procédé et la qualification de l’assemblage à confirmer'
    };
    reservations.push(labels[match.condition.key]||'un point technique à confirmer');
  }
  if(context.material==='inox')reservations.push('la nuance inox à préciser');
  if(reservations.length)opening+=` (${reservations.join(' ; ')})`;
  if(context.need&&context.need!=='courant'&&!match.needMatch){
    next='L’intérêt pour votre objectif reste à établir ; définissons avec votre référent ce qu’il faut vérifier avant de proposer ce gaz';
  }
  return `${opening}. ${next}.`;
}

export function weldingAdvice(product,journey={},match=null){
  const welding=product.welding||{};
  // A direct product lookup must not inherit a previous selection's answers.
  const selected=match?.product?.id===product.id?match:null;
  const context=selected?journey:{};
  const angle=angles[welding.manufacturerCode]||{
    focus:'l’application et le résultat attendu',
    question:'Quel gaz utilisez-vous aujourd’hui, et que souhaitez-vous conserver ou améliorer ?'
  };
  const name=product.name;
  const sourceUrl=product.sourceUrl||'';
  const checked=product.sources?.find(source=>source.url===sourceUrl)?.checked||'';
  const benefits=(welding.benefits||[]).map(text=>({text,sourceUrl,checked}));
  const pending=selected?.condition;
  const pitch=!selected
    ?`Vous envisagez ${name}. Vérifions d’abord son application à votre besoin, puis regardons ${angle.focus} pour préparer une proposition utile.`
    :guidedPitch(product,context,selected,angle);
  const question=needQuestions[context.need]||angle.question;

  const technical=[];
  if(!selected){
    technical.push('Aucune compatibilité n’est confirmée par cet accès direct. Relever le métal, la nuance, le procédé, le fil ou le métal d’apport, l’épaisseur et le mode de travail.');
    const conditions=WELDING_RULES.find(rule=>rule.code===welding.manufacturerCode)?.cases.flatMap(use=>use.condition?[use.condition.text]:[])||[];
    for(const condition of new Set(conditions))technical.push(`Selon l’application publiée : ${condition}`);
  }else{
    if(pending)technical.push(`À confirmer avant de retenir ${name} : ${pending.text}`);
    if(selected.confirmedCondition){
      technical.push(`${confirmations[selected.confirmedCondition.key]||selected.confirmedCondition.text} Cette information ne qualifie pas l’application ni le mode opératoire.`);
    }
    technical.push('Compléter la nuance exacte, l’épaisseur, le fil ou le métal d’apport, le régime et les exigences d’assemblage avec le référent soudage.');
    if(context.material==='inox')technical.push('La nuance inox reste à préciser. Les emplois réservés à une nuance particulière ne sont pas confirmés.');
    if(context.need&&context.need!=='courant'&&!selected.needMatch){
      technical.push('L’objectif choisi n’est pas explicitement rapproché de ce produit par les règles documentées du guide. Il reste à évaluer ; aucun gain ne doit en être déduit.');
    }
  }
  technical.push('Faire confirmer l’adéquation du gaz au mode opératoire avant un changement. Ne pas transposer automatiquement les réglages du gaz actuel.');
  if(!benefits.length)technical.push('Aucun bénéfice comparatif n’est documenté dans les sources consultées pour cette référence. Argumenter sur l’application publiée, sans promettre un gain.');
  if(welding.safety?.classificationCode==='1F')technical.push('Le produit est déclaré extrêmement inflammable. Reprendre sa FDS exacte et les conditions de mise en œuvre avec le référent du site.');
  else technical.push('Reprendre la FDS du produit livré, le raccordement et les consignes du site avant toute mise en œuvre.');

  const objections=[
    {
      id:'prix',title:'« Votre gaz est plus cher »',
      response:'Comparons le coût d’une pièce conforme, avec vos consommations et vos temps mesurés. Le prix du gaz compte, mais aussi le temps de soudage, les reprises et les interruptions. Si le changement ne démontre pas d’intérêt dans votre atelier, nous ne prétendrons pas qu’il est plus économique.',
      question:'Comparez-vous le prix du gaz seul ou une offre complète ? Quelles consommations et quels temps réels avez-vous pour une pièce représentative ?',
      next:'Relever les tarifs et prestations réellement comparables, la quantité consommée, le temps de travail et les reprises. Chiffrer seulement les postes documentés ; faire apparaître les données manquantes.'
    },
    {
      id:'actuel',title:'« Mon gaz actuel me convient »',
      response:`Conservons ce qui vous donne satisfaction. Pour examiner ${name}, il faut une raison concrète : un besoin nouveau, une difficulté précise ou un service à améliorer. Un changement de référence n’est pas un objectif en soi.`,
      question:`Sur ${angle.focus}, quel point justifierait pour vous d’étudier une autre solution ?`,
      next:'Reformuler une seule priorité avec le client et convenir de son critère de réussite. S’il n’y a pas de besoin identifié, garder la référence actuelle comme point de comparaison et convenir d’un suivi utile.'
    },
    {
      id:'reprises',title:'« Je veux moins de défauts et de reprises »',
      response:'Partons d’un défaut observé sur une pièce représentative. Le gaz seul ne suffit pas à expliquer les reprises : faisons examiner les conditions réelles avec votre référent soudage. Un avantage annoncé par le fabricant reste à vérifier sur votre application.',
      question:'Quel défaut constatez-vous, à quelle fréquence et avec quel temps de reprise ? Disposez-vous d’une pièce ou d’un relevé à examiner ?',
      next:`Relever les conditions du défaut et le résultat attendu. Faire confirmer si ${name} est une piste adaptée, puis comparer la conformité et le temps de reprise selon un protocole validé.`
    },
    {
      id:'changement',title:'« Changer va perturber la production »',
      response:'Préparons le changement avant de le décider : validation technique, disponibilité de la référence et créneau adapté à votre activité. Le nouvel essai ne doit pas supposer que les réglages actuels conviennent. Votre référent définit les conditions acceptables et la suite selon les résultats.',
      question:'Qui valide le mode opératoire et quel créneau permettrait une évaluation sans désorganiser votre production ?',
      next:'Nommer le référent, choisir une pièce représentative et convenir des critères d’acceptation. Confirmer le matériel et l’approvisionnement nécessaires avant de programmer l’essai ou le changement.'
    }
  ];

  const offer=[
    `Résumer l’application de ${name}, la priorité du client et les points techniques encore ouverts. Une référence présélectionnée ne vaut pas validation de l’assemblage.`,
    'Relever la consommation réelle, la fréquence d’utilisation, le nombre de postes, la mobilité et la fréquence des changements de bouteille.',
    'Choisir uniquement parmi les conditionnements publiés de cette référence. Confirmer le raccordement et les équipements nécessaires ; ne pas déduire un format du nom du gaz.',
    'Vérifier la disponibilité, les délais, les conditions d’approvisionnement et le tarif réel. Distinguer le gaz et les prestations incluses dans la proposition.',
    'Terminer par un engagement précis : information à fournir, personne responsable, prochaine action et date convenue avec le client.'
  ];

  const nextSteps=[
    {
      title:pending||!selected?'Lever les points techniques':'Confirmer l’application',
      text:pending?`${pending.text} Obtenir cette précision du client, puis faire valider le contexte complet par son référent soudage.`:!selected?'Identifier le matériau, le procédé et les conditions d’emploi avant de retenir la référence. Le nom du produit seul ne permet pas de conclure.':'Faire confirmer le contexte complet et le mode opératoire par le référent soudage. Les réponses du client orientent la sélection ; elles ne constituent pas une qualification.'
    },
    {
      title:'Préparer une proposition',
      text:'Relier le gaz et son conditionnement au besoin exprimé, à la consommation et aux contraintes du site. Confirmer prix, disponibilité et prestations avant de présenter l’offre.'
    },
    {
      title:'Organiser une comparaison',
      text:'Si une amélioration doit être démontrée, convenir d’une pièce représentative, de critères de conformité et d’un mode opératoire adapté validé. Comparer temps total, reprises et consommation réelle, puis décider avec le client.'
    }
  ];

  return {pitch,question,benefits,objections,technical,offer,nextSteps,sourceUrl};
}
