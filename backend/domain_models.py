from datetime import datetime
from typing import Optional, List

class User:
    def __init__(self, user_id: int, username: str, password_hash: str):
        self.user_id = user_id
        self.username = username
        self.password_hash = password_hash

        self.credit_account: Optional[CreditAccount] = None
        self.prompts: List['Prompt'] = []
        self.images: List['ImageAsset'] = []

    def register(self):
        # logic elsewhere
        pass

    def authenticate(self, password: str) -> bool:
        pass


class Admin(User):
    def __init__(self, user_id: int, username: str, password_hash: str):
        super().__init__(user_id, username, password_hash)

    def approve_prompt(self, prompt: 'Prompt'):
        prompt.status = "APPROVED"

    def reject_prompt(self, prompt: 'Prompt'):
        prompt.status = "REJECTED"

    def set_reward_ratio(self, ratio: float):
        # global values
        pass

    def manage_credit_package(self, package: 'CreditPackage'):
        pass


class CreditAccount:
    def __init__(self, account_id: int, user_id: int, balance: int = 0):
        self.account_id = account_id
        self.user_id = user_id
        self.balance = balance

    def credit(self, amount: int):
        self.balance += amount

    def debit(self, amount: int):
        if amount <= self.balance:
            self.balance -= amount
        else:
            raise ValueError("Insufficient Credits")

    def get_balance(self) -> int:
        return self.balance


class CreditPackage:
    def __init__(self, package_id: int, name: str, credits: int, price_label: str, active: bool = True):
        self.package_id = package_id
        self.name = name
        self.credits = credits
        self.price_label = price_label
        self.active = active

    def activate(self):
        self.active = True

    def deactivate(self):
        self.active = False

    def update(self, name: Optional[str] = None, credits: Optional[int] = None, price_label: Optional[str] = None):
        if name: self.name = name
        if credits: self.credits = credits
        if price_label: self.price_label = price_label

    def get_price_label(self) -> str:
        return self.price_label


class Prompt:
    def __init__(self, prompt_id: int, owner_id: int, content: str, public: bool = False):
        self.prompt_id = prompt_id
        self.owner_id = owner_id
        self.content = content
        self.public = public
        self.status = "PENDING"  # PENDING / APPROVED / REJECTED

        self.times_used = 0  # helps reward calculation

    def submit_for_review(self):
        self.status = "PENDING"

    def publish(self):
        self.public = True

    def update_content(self, new_content: str):
        self.content = new_content

    def apply_to(self, edit_session: 'EditSession'):
        edit_session.reused_prompt_id = self.prompt_id

class ImageAsset:
    def __init__(self, image_id: int, owner_id: int, url: str, asset_type: str):
        self.image_id = image_id
        self.owner_id = owner_id
        self.url = url
        self.asset_type = asset_type

        self.created_at = datetime.utcnow()

    def store(self):
        pass

    def generate_thumbnail(self):
        pass

    def delete(self):
        pass

class EditSession:
    def __init__(
        self,
        session_id: int,
        user_id: int,
        model_name: str,
        cfg_scale: float,
        steps: int,
        sampler: str,
        strength: float,
        seed: Optional[int] = None
    ):
        self.session_id = session_id
        self.user_id = user_id

        # Editing params (from Sprint 2 UML)
        self.model_name = model_name
        self.cfg_scale = cfg_scale
        self.steps = steps
        self.sampler = sampler
        self.strength = strength
        self.seed = seed

        self.inputs: List[ImageAsset] = []
        self.outputs: List[ImageAsset] = []
        self.reused_prompt_id: Optional[int] = None

        self.polished_prompt_text: Optional[str] = None

    def add_input(self, image: ImageAsset):
        self.inputs.append(image)

    def run(self):
        # qwen
        pass

    def get_outputs(self) -> List[ImageAsset]:
        return self.outputs
