from typing import Dict

PLAN_LABELS = {
    "standard": "HR Management (Standard)",
    "premium": "Talent Management (Premium)",
    "premium_plus": "Resource Management (Premium +)",
    "learning_plus": "Learning & Development (Premium +)"
}

PLAN_FEATURE_MAP = {
    "standard": {
        "feature_hr_team": True,
        "feature_talent_mgmt": False,
        "feature_resource_mgmt": False,
        "feature_learning_dev": False
    },
    "premium": {
        "feature_hr_team": True,
        "feature_talent_mgmt": True,
        "feature_resource_mgmt": False,
        "feature_learning_dev": False
    },
    "premium_plus": {
        "feature_hr_team": True,
        "feature_talent_mgmt": True,
        "feature_resource_mgmt": True,
        "feature_learning_dev": False
    },
    "learning_plus": {
        "feature_hr_team": True,
        "feature_talent_mgmt": True,
        "feature_resource_mgmt": True,
        "feature_learning_dev": True
    },
    # Legacy compatibility
    "starter": {
        "feature_hr_team": True,
        "feature_talent_mgmt": False,
        "feature_resource_mgmt": False,
        "feature_learning_dev": False
    },
    "professional": {
        "feature_hr_team": True,
        "feature_talent_mgmt": True,
        "feature_resource_mgmt": False,
        "feature_learning_dev": False
    },
    "growth": {
        "feature_hr_team": True,
        "feature_talent_mgmt": True,
        "feature_resource_mgmt": True,
        "feature_learning_dev": False
    },
    "enterprise": {
        "feature_hr_team": True,
        "feature_talent_mgmt": True,
        "feature_resource_mgmt": True,
        "feature_learning_dev": False
    }
}


def resolve_plan_features(plan: str) -> Dict[str, bool]:
    if not plan:
        return PLAN_FEATURE_MAP["standard"]
    plan_key = plan.strip().lower()
    return PLAN_FEATURE_MAP.get(plan_key, PLAN_FEATURE_MAP["standard"])


def get_plan_label(plan: str) -> str:
    if not plan:
        return PLAN_LABELS["standard"]
    return PLAN_LABELS.get(plan.strip().lower(), PLAN_LABELS["standard"])
