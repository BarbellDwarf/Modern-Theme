<?php

use humhub\components\Migration;

class m260401_000000_add_reaction_type_to_like extends Migration
{
    public function up()
    {
        // Add reaction_type column with default 'like' (idempotent).
        // Core's unique index on (content/target, created_by) is left untouched:
        // reactions are mutually exclusive per user and target, so one row per
        // target is enough and HumHub 1.19's core migration expects the original
        // index name to still exist.
        $this->safeAddColumn('{{%like}}', 'reaction_type', $this->string(50)->notNull()->defaultValue('like'));
    }

    public function down()
    {
        $this->safeDropColumn('{{%like}}', 'reaction_type');
    }
}
