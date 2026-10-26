<?php
/**
 * Modern Theme 2026 — Profile About override
 *
 * Extends the core view to render phone fields as tel: links, email fields as
 * mailto: links, and hides rows whose value is empty.
 */

use humhub\components\View;
use humhub\helpers\Html;
use humhub\modules\content\widgets\richtext\RichText;
use humhub\modules\user\models\fieldtype\MarkdownEditor;
use humhub\modules\user\models\fieldtype\UserEmail;

/**
 * @var $this View
 * @var $user \humhub\modules\user\models\User
 */

$categories = $user->profile->getProfileFieldCategories();
$phoneFields = ['phone_private', 'phone_work'];

$renderValue = static function ($field) use ($user, $phoneFields): string {
    if ($field->field_type_class === MarkdownEditor::class) {
        return (string)RichText::output($field->getUserValue($user, true, false));
    }

    if ($field->field_type_class === UserEmail::class) {
        return (string)$field->getUserValue($user, false);
    }

    if (in_array($field->internal_name, $phoneFields, true)) {
        $phone = trim((string)$field->getUserValue($user, true, false));
        if ($phone === '') {
            return '';
        }

        $telHref = 'tel:' . preg_replace('/[^\d+\-\(\)\s]/', '', $phone);
        return Html::a(Html::encode($phone), $telHref, ['class' => 'mt2026-tel-link']);
    }

    return (string)$field->getUserValue($user, false);
};

$sections = [];
foreach ($categories as $category) {
    $rows = [];
    foreach ($user->profile->getProfileFields($category) as $field) {
        $value = $renderValue($field);
        $plain = preg_replace('/\s+/u', '', strip_tags(html_entity_decode($value))) ?? '';
        if ($plain === '' && stripos($value, '<img') === false) {
            continue;
        }
        $rows[] = ['field' => $field, 'value' => $value];
    }

    if ($rows !== []) {
        $sections[] = ['category' => $category, 'rows' => $rows];
    }
}
?>

<?php if ($sections !== []): ?>
<div id="user-profile-about" class="panel panel-default">
    <div class="panel-heading">
        <?= Yii::t('UserModule.profile', '<strong>About</strong> this user') ?>
    </div>

    <div class="panel-body">
        <?php if (count($sections) > 1): ?>
            <ul id="tabs" class="nav nav-tabs" data-tabs="tabs">
                <?php foreach ($sections as $index => $section): ?>
                    <li class="nav-item">
                        <a href="#profile-category-<?= $section['category']->id ?>"
                             class="nav-link<?= $index === 0 ? ' active' : '' ?>"
                             data-bs-toggle="tab"><?= Html::encode(Yii::t($section['category']->getTranslationCategory(), $section['category']->title)) ?></a>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

        <div class="tab-content">
            <?php foreach ($sections as $index => $section): ?>
                <div class="tab-pane <?= $index === 0 ? ' active' : '' ?> container gx-0 overflow-x-hidden" id="profile-category-<?= $section['category']->id ?>">
                    <?php foreach ($section['rows'] as $row): ?>
                        <div class="profile-item row mt-3" data-profile-field-internal-name="<?= $row['field']->internal_name ?>">
                            <label class="col-md-3 field-title text-lg-end">
                                <?= Html::encode(Yii::t($row['field']->getTranslationCategory(), $row['field']->title)) ?>
                            </label>
                            <div class="col-md-9 field-value">
                                <?= $row['value'] ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
<?php endif; ?>
